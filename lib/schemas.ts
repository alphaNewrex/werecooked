import { z } from 'zod';

export const PantryItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  quantity: z.string().optional(),
  category: z.string().optional(),
  addedAt: z.number(),
});

export const RecipeIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().min(1),
  haveIt: z.boolean(),
  estPriceUsd: z.number().nonnegative().optional(),
});

export const RecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  servings: z.number().int().positive(),
  timeMinutes: z.number().int().positive(),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(z.string().min(1)).min(1),
});

export const PantryNamesRequestSchema = z.object({
  pantry: z.array(z.string().min(1)).max(200),
});

export const ScanPantryRequestSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1),
});

export const ReelRequestSchema = ScanPantryRequestSchema.extend({
  pantry: z.array(z.string().min(1)).max(200),
});

export const GroceryLinkRequestSchema = z.object({
  title: z.string().min(1),
  items: z.array(
    z.object({
      name: z.string().min(1),
      amount: z.string().min(1),
    }),
  ),
});

export const ScanPantryResponseSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().optional(),
      category: z.string().optional(),
    }),
  ),
});

export const SuggestResponseSchema = z.object({
  recipes: z.array(RecipeSchema).length(3),
});

export const ReelResponseSchema = z.object({
  recipe: RecipeSchema,
  sourceNotes: z.string(),
});
