import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeneratedRecipe } from './claude';

export interface SavedRecipe extends GeneratedRecipe {
  id: string;
  savedAt: number;
}

const RECIPES_KEY = 'picook_saved_recipes';
const USTENSILS_KEY = 'picook_ustensils';

export const ALL_USTENSILS = [
  'Plaques de cuisson',
  'Four',
  'Micro-ondes',
  'Friteuse',
  'Air-fryer',
  'Mixeur',
  'Robot cuiseur',
];

export async function getSavedRecipes(): Promise<SavedRecipe[]> {
  const raw = await AsyncStorage.getItem(RECIPES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as SavedRecipe[];
}

export async function saveRecipe(recipe: GeneratedRecipe): Promise<SavedRecipe> {
  const saved = await getSavedRecipes();
  const newRecipe: SavedRecipe = { ...recipe, id: Date.now().toString(), savedAt: Date.now() };
  saved.unshift(newRecipe);
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(saved));
  return newRecipe;
}

export async function deleteRecipe(id: string): Promise<void> {
  const saved = await getSavedRecipes();
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(saved.filter(r => r.id !== id)));
}

export async function getUstensils(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(USTENSILS_KEY);
  if (!raw) return ALL_USTENSILS;
  return JSON.parse(raw) as string[];
}

export async function saveUstensils(ustensils: string[]): Promise<void> {
  await AsyncStorage.setItem(USTENSILS_KEY, JSON.stringify(ustensils));
}
