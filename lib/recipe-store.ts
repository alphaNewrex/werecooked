import type { RecipeSource, Recipe } from './types';

export type CurrentRecipe = {
  recipe: Recipe;
  source: RecipeSource;
  entryId?: string;
  collection?: 'incoming' | 'cookbook';
};

let currentRecipe: CurrentRecipe | null = null;

export function setCurrentRecipe(value: CurrentRecipe) {
  currentRecipe = value;
}

export function getCurrentRecipe() {
  return currentRecipe;
}
