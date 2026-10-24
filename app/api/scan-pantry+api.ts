import { generateObject } from 'ai';

import { getAiModel, imagePrompt } from '@/lib/ai.server';
import {
  ScanPantryRequestSchema,
  ScanPantryResponseSchema,
} from '@/lib/schemas';

function errorResponse(error: unknown, status = 500) {
  return Response.json(
    { message: error instanceof Error ? error.message : 'Unable to scan pantry.' },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const input = ScanPantryRequestSchema.safeParse(await request.json());
    if (!input.success) {
      return errorResponse(new Error('imageBase64 and mimeType are required.'), 400);
    }

    const result = await generateObject({
      model: getAiModel(),
      schema: ScanPantryResponseSchema,
      schemaName: 'PantryScan',
      messages: [
        imagePrompt(
          input.data.imageBase64,
          input.data.mimeType,
          'Identify each visible food or pantry item. Return practical names, an optional quantity, and a broad category. Do not include cookware, packaging, or text that is not an ingredient.',
        ),
      ],
    });
    return Response.json(result.object);
  } catch (error) {
    return errorResponse(error);
  }
}
