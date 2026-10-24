import { getKrogerPrices } from '@/lib/kroger.server';
import { KrogerPricesRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const input = KrogerPricesRequestSchema.safeParse(await request.json());
  if (!input.success) {
    return Response.json(
      { message: 'items must contain 1 to 30 names and zip must be a 5-digit ZIP code.' },
      { status: 400 },
    );
  }
  const result = await getKrogerPrices(
    input.data.items.map((item) => item.name),
    input.data.zip,
  );
  return Response.json(result);
}
