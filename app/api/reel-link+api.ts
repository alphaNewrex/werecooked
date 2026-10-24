import { generateObject } from 'ai';

import { getAiModel } from '@/lib/ai.server';
import { fetchReelCaption, extractShortcode } from '@/lib/instagram.server';
import { reelInstructions } from '@/lib/reel.server';
import { ReelLinkRequestSchema, ReelResponseSchema } from '@/lib/schemas';

function errorResponse(error: unknown, status = 500, extra?: Record<string, unknown>) {
  return Response.json(
    { message: error instanceof Error ? error.message : 'Unable to read this reel link.', ...extra },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const input = ReelLinkRequestSchema.safeParse(await request.json());
    if (!input.success) {
      return errorResponse(new Error('A valid Instagram URL and pantry are required.'), 400);
    }

    const shortcode = extractShortcode(input.data.url);
    if (!shortcode) {
      return errorResponse(
        new Error('Only public HTTPS Instagram reel, reels, or post URLs are supported.'),
        400,
      );
    }

    const caption = await fetchReelCaption(shortcode);
    if (!caption) {
      return errorResponse(
        new Error("Couldn't read this reel's caption — add a screenshot instead."),
        422,
        { needScreenshot: true },
      );
    }

    const result = await generateObject({
      model: getAiModel(),
      schema: ReelResponseSchema,
      schemaName: 'ReelLinkRecipe',
      prompt: reelInstructions(input.data.pantry, caption.caption),
    });
    return Response.json({
      ...result.object,
      sourceNotes: `From Instagram caption (${caption.source}). ${result.object.sourceNotes}`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
