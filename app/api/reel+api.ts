import { generateObject } from 'ai';

import { getAiModel, imagePrompt } from '@/lib/ai.server';
import { reelInstructions } from '@/lib/reel.server';
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
          reelInstructions(input.data.pantry),
        ),
      ],
    });
    return Response.json(result.object);
  } catch (error) {
    return errorResponse(error);
  }
}
