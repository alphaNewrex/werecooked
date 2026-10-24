export type PantryItem = {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  addedAt: number;
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
