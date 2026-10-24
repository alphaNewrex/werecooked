import { generateObject } from 'ai';

import { getAiModel, imagePrompt } from '@/lib/ai.server';
import { ReelRequestSchema, ReelResponseSchema } from '@/lib/schemas';

function errorResponse(error: unknown, status = 500) {
  return Response.json(
    { message: error instanceof Error ? error.message : 'Unable to read this reel.' },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const input = ReelRequestSchema.safeParse(await request.json());
    if (!input.success) {
      return errorResponse(new Error('imageBase64, mimeType, and pantry are required.'), 400);
    }

    const result = await generateObject({
      model: getAiModel(),
      schema: ReelResponseSchema,
      schemaName: 'ReelRecipe',
      messages: [
        imagePrompt(
          input.data.imageBase64,
          input.data.mimeType,
          `Read the caption and on-screen text in this social video screenshot. Infer the featured dish and reconstruct a complete ingredient list and concise cooking steps. Compare ingredients with this pantry: ${input.data.pantry.join(', ') || 'an empty pantry'}.

Set haveIt using that pantry. Always treat salt, pepper, water, and cooking oil as haveIt=true. Estimate a USD price in estPriceUsd for each missing item. sourceNotes should state what text was readable and how confident the inference is.`,
        ),
      ],
    });
    return Response.json(result.object);
  } catch (error) {
    return errorResponse(error);
  }
}
