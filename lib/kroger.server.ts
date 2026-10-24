import type { KrogerMatch, KrogerPriceResult, KrogerStore } from './types';

const API_ORIGIN = 'https://api.kroger.com';
const REQUEST_TIMEOUT_MS = 8000;
const TOKEN_REFRESH_BUFFER_MS = 60_000;

let tokenCache: { value: string; expiresAt: number } | null = null;
const locationCache = new Map<string, KrogerStore | null>();

type KrogerTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

type KrogerLocation = {
  locationId?: string;
  name?: string;
  chain?: { name?: string };
  address?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

type KrogerProduct = {
  productId?: string;
  description?: string;
  brand?: string | { name?: string };
  items?: Array<{
    size?: string;
    price?: { regular?: number; promo?: number };
  }>;
};

function configuredCredentials() {
  return {
    clientId: process.env.KROGER_CLIENT_ID,
    clientSecret: process.env.KROGER_CLIENT_SECRET,
  };
}

async function getAccessToken(clientId: string, clientSecret: string) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS) {
    return tokenCache.value;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${API_ORIGIN}/v1/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Kroger token request failed (${response.status}).`);
  }
  const data = (await response.json()) as KrogerTokenResponse;
  if (!data.access_token) {
    throw new Error('Kroger token response did not include an access token.');
  }
  tokenCache = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
  };
  return data.access_token;
}

async function findStore(token: string, zip: string) {
  if (locationCache.has(zip)) {
    return locationCache.get(zip) ?? null;
  }
  const params = new URLSearchParams({
    'filter.zipCode.near': zip,
    'filter.limit': '1',
  });
  const response = await fetch(`${API_ORIGIN}/v1/locations?${params}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Kroger location request failed (${response.status}).`);
  }
  const data = (await response.json()) as { data?: KrogerLocation[] };
  const location = data.data?.[0];
  if (!location?.locationId) {
    locationCache.set(zip, null);
    return null;
  }
  const address = location.address;
  const store: KrogerStore = {
    locationId: location.locationId,
    name: location.chain?.name ?? location.name ?? 'Kroger',
    address: [
      address?.addressLine1,
      address?.city,
      address?.state,
      address?.zipCode,
    ]
      .filter(Boolean)
      .join(', '),
  };
  locationCache.set(zip, store);
  return store;
}

function productMatch(product: KrogerProduct, requestedName: string): KrogerMatch | null {
  const item = product.items?.find((candidate) => {
    const regular = Number(candidate.price?.regular ?? 0);
    const promo = Number(candidate.price?.promo ?? 0);
    return regular > 0 || promo > 0;
  });
  if (!item?.price) {
    return null;
  }
  const regularUsd = Number(item.price.regular ?? 0);
  const promoUsd = Number(item.price.promo ?? 0);
  const priceUsd = promoUsd > 0 ? promoUsd : regularUsd;
  if (priceUsd <= 0 || !product.productId) {
    return null;
  }
  return {
    productId: product.productId,
    description: product.description ?? requestedName,
    brand: typeof product.brand === 'string' ? product.brand : product.brand?.name,
    size: item.size,
    priceUsd,
    regularUsd: regularUsd > 0 ? regularUsd : priceUsd,
    onSale: promoUsd > 0 && regularUsd > promoUsd,
    url: `https://www.kroger.com/p/item/${product.productId}`,
  };
}

async function findPrice(token: string, store: KrogerStore, name: string) {
  const params = new URLSearchParams({
    'filter.term': name,
    'filter.locationId': store.locationId,
    'filter.limit': '5',
  });
  const response = await fetch(`${API_ORIGIN}/v1/products?${params}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Kroger product request failed (${response.status}).`);
  }
  const data = (await response.json()) as { data?: KrogerProduct[] };
  for (const product of data.data ?? []) {
    const match = productMatch(product, name);
    if (match) {
      return match;
    }
  }
  return null;
}

export async function getKrogerPrices(names: string[], zip?: string): Promise<KrogerPriceResult> {
  const { clientId, clientSecret } = configuredCredentials();
  if (!clientId || !clientSecret) {
    return {
      store: null,
      results: [],
      reason: 'Kroger is not configured on the server.',
    };
  }
  const requestedZip = zip ?? process.env.KROGER_ZIP;
  if (!requestedZip) {
    return { store: null, results: [], reason: 'No ZIP code for Kroger pricing.' };
  }

  try {
    const token = await getAccessToken(clientId, clientSecret);
    const store = await findStore(token, requestedZip);
    if (!store) {
      return { store: null, results: [], reason: 'No Kroger store found for ZIP code.' };
    }
    const results = await Promise.all(
      names.map(async (name) => {
        try {
          return { name, match: await findPrice(token, store, name) };
        } catch {
          return { name, match: null };
        }
      }),
    );
    return { store, results };
  } catch {
    return {
      store: null,
      results: names.map((name) => ({ name, match: null })),
      reason: 'Kroger pricing is temporarily unavailable.',
    };
  }
}
