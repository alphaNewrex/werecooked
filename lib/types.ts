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
