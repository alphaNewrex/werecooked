import { generateObject } from 'ai';

import { getAiModel } from '@/lib/ai.server';
import { PantryNamesRequestSchema, SuggestResponseSchema } from '@/lib/schemas';

function errorResponse(error: unknown, status = 500) {
  return Response.json(
    { message: error instanceof Error ? error.message : 'Unable to suggest recipes.' },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const input = PantryNamesRequestSchema.safeParse(await request.json());
    if (!input.success) {
      return errorResponse(new Error('pantry must be an array of ingredient names.'), 400);
    }

    const result = await generateObject({
      model: getAiModel(),
      schema: SuggestResponseSchema,
      schemaName: 'RecipeSuggestions',
      prompt: `Suggest exactly three distinct, approachable recipes ranked by how many ingredients are already in this pantry: ${input.data.pantry.join(', ') || 'an empty pantry'}.

For every ingredient, set haveIt based on the provided pantry. Always treat salt, pepper, water, and cooking oil as haveIt=true. Estimate a USD price for each missing ingredient in estPriceUsd. Keep recipes realistic and include concise steps.`,
    });
    return Response.json(result.object);
  } catch (error) {
    return errorResponse(error);
  }
}
