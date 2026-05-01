import type { GeneratedRecipe } from './claude';

let _recipe: GeneratedRecipe | null = null;

export function setCurrentRecipe(recipe: GeneratedRecipe): void {
  _recipe = recipe;
}

export function getCurrentRecipe(): GeneratedRecipe | null {
  return _recipe;
}
