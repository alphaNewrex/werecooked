import { generateObject } from 'ai';

import { getAiModel } from '@/lib/ai.server';
import { fetchReelCaption, extractShortcode } from '@/lib/instagram.server';
import { reelInstructions } from '@/lib/reel.server';
import { ReelLinkAiSchema, ReelLinkRequestSchema, ReelResponseSchema } from '@/lib/schemas';

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
      schema: ReelLinkAiSchema,
      schemaName: 'ReelLinkRecipe',
      prompt: `${reelInstructions(input.data.pantry, caption.caption)}

Set captionDescribesRecipe=true only if the caption itself names a specific dish or lists ingredients. If it does not (for example, it is only a greeting, a trend reference, or hashtags without food), set captionDescribesRecipe=false and do not invent a dish from the pantry; still return a minimal placeholder recipe.`,
    });
    const { captionDescribesRecipe, ...reel } = result.object;
    if (!captionDescribesRecipe) {
      return errorResponse(
        new Error("This reel's caption doesn't describe a recipe — add a screenshot instead."),
        422,
        { needScreenshot: true },
      );
    }
    return Response.json({
      ...ReelResponseSchema.parse(reel),
      sourceNotes: `From Instagram caption (${caption.source}). ${reel.sourceNotes}`,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
