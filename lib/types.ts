export type Macros = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fdcId: number;
  matchedName: string;
};

export type PantryItem = {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  addedAt: number;
  macros?: Macros;
};

export type RecipeIngredient = {
  name: string;
  amount: string;
  haveIt: boolean;
  estPriceUsd?: number;
};

export type Recipe = {
  title: string;
  description: string;
  servings: number;
  timeMinutes: number;
  ingredients: RecipeIngredient[];
  steps: string[];
};

export type KrogerStore = {
  locationId: string;
  name: string;
  address: string;
};

export type KrogerMatch = {
  productId: string;
  description: string;
  brand?: string;
  size?: string;
  priceUsd: number;
  regularUsd: number;
  onSale: boolean;
  url: string;
};

export type KrogerPriceResult = {
  store: KrogerStore | null;
  results: Array<{ name: string; match: KrogerMatch | null }>;
  reason?: string;
};
