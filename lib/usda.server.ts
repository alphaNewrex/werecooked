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

// Descriptions with these words are processed or partial forms of a food. They are
// penalized unless the query itself asks for them (for example, "egg white").
const PENALIZED_WORDS = new Set([
  'babyfood',
  'chips',
  'dehydrated',
  'dried',
  'fast',
  'free',
  'frozen',
  'juice',
  'low',
  'powder',
  'reduced',
  'restaurant',
  'snacks',
  'souffle',
  'substitute',
  'topping',
  'white',
  'yolk',
]);
const COMBO_WORDS = new Set(['and', 'with']);
const PREFERRED_WORDS = new Set(['raw', 'whole']);

function tokens(text: string) {
  return text.toLowerCase().match(/[a-z]+/g) ?? [];
}

// Treats singular and simple plural forms as the same word ("egg"/"eggs", "tomato"/"tomatoes").
function sameWord(a: string, b: string) {
  return a === b || a + 's' === b || b + 's' === a || a + 'es' === b || b + 'es' === a;
}

function containsWord(words: string[], word: string) {
  return words.some((candidate) => sameWord(candidate, word));
}

/**
 * Scores an FDC description for a generic ingredient name. USDA descriptions are
 * comma-separated from general to specific ("Eggs, Grade A, Large, egg whole"), so the
 * query should appear in the first two segments, ideally as the first word, and the
 * whole/raw form beats partial, processed, branded, or combination foods.
 */
function scoreDescription(description: string, queryWords: string[]) {
  const segments = description.split(',');
  const allWords = tokens(description);
  const headWords = tokens(segments.slice(0, 2).join(' '));
  let score = 0;

  if (!queryWords.every((word) => containsWord(allWords, word))) {
    score -= 10;
  }
  if (queryWords.every((word) => containsWord(headWords, word))) {
    score += 4;
  }
  if (allWords[0] && containsWord(queryWords, allWords[0])) {
    score += 2;
  }
  for (const word of new Set(allWords)) {
    if (containsWord(queryWords, word)) {
      continue;
    }
    if (PREFERRED_WORDS.has(word)) {
      score += 2;
    } else if (PENALIZED_WORDS.has(word)) {
      score -= 5;
    } else if (COMBO_WORDS.has(word)) {
      score -= 3;
    }
  }
  // Brand and restaurant entries use all-caps names ("PIZZA HUT", "McDONALD'S").
  if (/[A-Z]{3,}/.test(description)) {
    score -= 5;
  }
  // Prefer simpler descriptions among otherwise equal candidates.
  score -= segments.length * 0.5;
  return score;
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

function macrosFor(food: FdcFood): Macros | null {
  if (!food.fdcId || !food.description) {
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
    carbsG: Math.max(0, carbsG),
    fatG,
    fdcId: food.fdcId,
    matchedName: food.description,
  };
}

async function searchFoods(query: string): Promise<FdcFood[]> {
  const params = new URLSearchParams({
    query,
    dataType: 'Foundation,SR Legacy',
    pageSize: '10',
    api_key: process.env.USDA_API_KEY ?? 'DEMO_KEY',
  });
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as FdcSearchResponse;
  return data.foods ?? [];
}

export async function lookupMacros(name: string): Promise<Macros | null> {
  try {
    const query = name.trim();
    const queryWords = tokens(query);
    if (!queryWords.length) {
      return null;
    }
    let best: { macros: Macros; score: number } | null = null;
    for (const food of await searchFoods(query)) {
      const macros = macrosFor(food);
      if (!macros) {
        continue;
      }
      const score = scoreDescription(macros.matchedName, queryWords);
      // Strictly greater keeps USDA's relevance order as the tie-breaker.
      if (!best || score > best.score) {
        best = { macros, score };
      }
    }
    return best?.macros ?? null;
  } catch {
    return null;
  }
}
