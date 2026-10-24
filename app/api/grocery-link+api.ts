import { GroceryLinkRequestSchema } from '@/lib/schemas';

function errorResponse(error: unknown, status = 500) {
  return Response.json(
    { message: error instanceof Error ? error.message : 'Unable to create a grocery link.' },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const input = GroceryLinkRequestSchema.safeParse(await request.json());
    if (!input.success) {
      return errorResponse(new Error('title and items are required.'), 400);
    }
    const apiKey = process.env.INSTACART_API_KEY;
    if (!apiKey) {
      return Response.json({ url: null, reason: 'INSTACART_API_KEY is not configured on the server.' });
    }

    const response = await fetch(
      'https://connect.dev.instacart.tools/idp/v1/products/products_link',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: input.data.title,
          link_type: 'shopping_list',
          line_items: input.data.items.map((item) => ({
            name: item.name,
            display_text: `${item.amount} ${item.name}`,
            line_item_measurements: [{ quantity: 1, unit: 'each' }],
          })),
        }),
      },
    );
    if (!response.ok) {
      const details = await response.text();
      return errorResponse(
        new Error(`Instacart returned ${response.status}: ${details.slice(0, 300)}`),
        502,
      );
    }
    const data = (await response.json()) as { products_link_url?: string };
    return Response.json({ url: data.products_link_url ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}
