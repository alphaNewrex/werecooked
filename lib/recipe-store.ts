import type { Recipe } from './types';

let currentRecipe: Recipe | null = null;

export function setCurrentRecipe(recipe: Recipe) {
  currentRecipe = recipe;
}

export function getCurrentRecipe() {
  return currentRecipe;
}
