import { lookupMacros } from '@/lib/usda.server';
import { NutritionRequestSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const input = NutritionRequestSchema.safeParse(await request.json());
  if (!input.success) {
    return Response.json({ message: 'names must be an array of up to 30 ingredient names.' }, { status: 400 });
  }
  const results = await Promise.all(
    input.data.names.map(async (name) => ({ name, macros: await lookupMacros(name) })),
  );
  return Response.json({ results });
}
