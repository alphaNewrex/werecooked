# CookFood

CookFood is a hackathon MVP Expo app that turns a pantry or a saved cooking-reel screenshot into practical recipes: people can manually manage pantry inventory, scan food photos for reviewable detections, ask AI what they can cook, compare a reel recipe against what they have, estimate missing-item prices, and create a grocery handoff. It uses Expo Router with native tabs and one shared recipe stack screen; server-only Expo Router API routes call the Vercel AI SDK through a provider registry, while pantry data is persisted locally through AsyncStorage and the active recipe is passed through a tiny module-level store.

## Architecture

- `app/(tabs)/index.tsx`: pantry CRUD and camera/library scan review.
- `app/(tabs)/cook.tsx`: pantry-based recipe suggestions.
- `app/(tabs)/reel.tsx`: screenshot upload and reel recipe extraction.
- `app/recipe.tsx`: shared recipe detail, missing-item estimates, and grocery sharing.
- `app/api/*+api.ts`: server-side scan, suggestion, reel, and Instacart routes.
- `lib/ai.server.ts`: server-only AI provider registry and model selection.
- `lib/schemas.ts`: shared Zod request/response and AI object schemas.
- `lib/pantry.tsx`: `PantryProvider`/`usePantry` with AsyncStorage persistence.
- `lib/api.ts`: one native-safe JSON POST helper; set `EXPO_PUBLIC_API_URL` when relative routes are not reachable from a physical device.

## Data shapes

`PantryItem` is `{ id: string; name: string; quantity?: string; category?: string; addedAt: number }`. `RecipeIngredient` is `{ name: string; amount: string; haveIt: boolean; estPriceUsd?: number }`, where estimated price is used only for missing ingredients. `Recipe` is `{ title: string; description: string; servings: number; timeMinutes: number; ingredients: RecipeIngredient[]; steps: string[] }`.

## Environment

- `AI_MODEL`: required on the server in `provider:model-id` form.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`: provider keys; only the provider selected by `AI_MODEL` is required.
- `INSTACART_API_KEY`: optional; without it, grocery-link returns `{ "url": null }` and the app shares a plain shopping list.
- `EXPO_PUBLIC_API_URL`: optional native client API origin, for example a LAN URL to the Expo Router server.

Keep local `.env` files out of git. The server returns clear JSON errors when AI configuration is missing.

## Commands

- `npm install`
- `npx expo start`
- `npx tsc --noEmit`
