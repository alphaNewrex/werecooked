import type { Macros } from './types';

type FdcNutrient = {
  nutrientId?: number;
  value?: number;
};

type FdcFood = {
  fdcId?: number;
  description?: string;
  foodNutrients?: FdcNutrient[];
};

type FdcSearchResponse = {
  foods?: FdcFood[];
};

async function searchFood(query: string): Promise<FdcFood | null> {
  const params = new URLSearchParams({
    query,
    dataType: 'Foundation,SR Legacy',
    pageSize: '1',
    api_key: process.env.USDA_API_KEY ?? 'DEMO_KEY',
  });
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as FdcSearchResponse;
  return data.foods?.[0] ?? null;
}

function nutrientValue(food: FdcFood, nutrientIds: number[]) {
  for (const nutrientId of nutrientIds) {
    const match = food.foodNutrients?.find((nutrient) => nutrient.nutrientId === nutrientId);
    if (typeof match?.value === 'number') {
      return match.value;
    }
  }
  return null;
}

export async function lookupMacros(name: string): Promise<Macros | null> {
  try {
    const trimmedName = name.trim();
    let food = await searchFood(trimmedName);
    if (
      food?.description &&
      /\b(dehydrated|powder|chips|dried)\b/i.test(food.description) &&
      !/\b(raw|fresh)\b/i.test(trimmedName)
    ) {
      food = (await searchFood(`${trimmedName} raw`)) ?? food;
    }
    if (!food?.fdcId || !food.description) {
      return null;
    }
    const proteinG = nutrientValue(food, [1003]);
    const fatG = nutrientValue(food, [1004]);
    const carbsG = nutrientValue(food, [1005]);
    const kcal = nutrientValue(food, [1008, 2047, 2048]);
    if (proteinG === null || fatG === null || carbsG === null || kcal === null) {
      return null;
    }
    return {
      kcal,
      proteinG,
      carbsG,
      fatG,
      fdcId: food.fdcId,
      matchedName: food.description,
    };
  } catch {
    return null;
  }
}
