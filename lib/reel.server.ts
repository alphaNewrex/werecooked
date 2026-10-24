export function reelInstructions(pantry: string[], caption?: string) {
  const source = caption
    ? `Here is the reel caption, copied from Instagram:

${caption}`
    : 'Read the caption and on-screen text in this social video screenshot.';
  return `${source} Infer the featured dish and reconstruct a complete ingredient list and concise cooking steps. Compare ingredients with this pantry: ${pantry.join(', ') || 'an empty pantry'}.

Set haveIt using that pantry. Always treat salt, pepper, water, and cooking oil as haveIt=true. Estimate a USD price in estPriceUsd for each missing item. sourceNotes should state what source text was readable and how confident the inference is.`;
}
