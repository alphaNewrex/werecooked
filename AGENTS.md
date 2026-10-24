# CookFood

CookFood is a hackathon MVP Expo app that turns a pantry or a saved cooking-reel screenshot into practical recipes: people can manually manage pantry inventory, scan food photos for reviewable detections, ask AI what they can cook, compare a reel recipe against what they have, estimate missing-item prices, and create a grocery handoff. It uses Expo Router with native tabs and one shared recipe stack screen; server-only Expo Router API routes call the Vercel AI SDK through a provider registry, while pantry data is persisted locally through AsyncStorage and the active recipe is passed through a tiny module-level store.

## Architecture

- `app/(tabs)/index.tsx`: pantry CRUD and camera/library scan review.
- `app/(tabs)/cook.tsx`: pantry-based recipe suggestions.
- `app/(tabs)/reel.tsx`: screenshot upload and reel recipe extraction.
- `app/recipe.tsx`: shared recipe detail, missing-item estimates, and grocery sharing.
- `app/api/*+api.ts`: server-side scan, suggestion, reel, and Instacart routes.
- `app/api/nutrition+api.ts`: server-only USDA FoodData Central macro lookup.
- `lib/ai.server.ts`: server-only AI provider registry and model selection.
- `lib/schemas.ts`: shared Zod request/response and AI object schemas.
- `lib/pantry.tsx`: `PantryProvider`/`usePantry` with AsyncStorage persistence and silent USDA macro enrichment after pantry writes.
- `lib/api.ts`: one native-safe JSON POST helper; set `EXPO_PUBLIC_API_URL` when relative routes are not reachable from a physical device.

## Share from Instagram

CookFood runs in Expo Go, so the iPhone share-sheet integration uses an iOS Shortcut instead of a native share extension. In the app’s Reel tab, copy the selectable **Shortcut link** base. In the **Shortcuts** app: **New Shortcut** named **CookFood** → open **Details/info** and enable **Show in Share Sheet**, accepting **URLs and Text** → add **URL Encode** with **Shortcut Input** → add **Text** containing `<shortcut link shown in app>?url=` followed by the **URL Encoded Text** magic variable → add **Open URLs**. Sharing an Instagram reel to CookFood opens `reel?url=...`, extracts its caption, and falls back to the screenshot picker when Instagram does not expose one. The shortcut base changes if the Mac IP changes.

## Data shapes

`PantryItem` is `{ id: string; name: string; quantity?: string; category?: string; addedAt: number }`. `RecipeIngredient` is `{ name: string; amount: string; haveIt: boolean; estPriceUsd?: number }`, where estimated price is used only for missing ingredients. `Recipe` is `{ title: string; description: string; servings: number; timeMinutes: number; ingredients: RecipeIngredient[]; steps: string[] }`.

## Environment

- `AI_MODEL`: required on the server in `provider:model-id` form. For Azure, the model id is the Foundry deployment name, for example `azure:your-deployment-name`.
- `AZURE_API_KEY`: required for `AI_MODEL=azure:...`.
- `AZURE_RESOURCE_NAME`: Azure resource name when using the default endpoint.
- `AZURE_BASE_URL`: optional Azure endpoint override; it wins over `AZURE_RESOURCE_NAME`. Azure deployments must support vision/image input and structured JSON output because pantry scans and reel screenshots use both.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`: alternative provider keys; only the provider selected by `AI_MODEL` is required.
- `INSTACART_API_KEY`: optional; without it, grocery-link returns `{ "url": null }` and the app shares a plain shopping list.
- `USDA_API_KEY`: optional FoodData Central API key for pantry macros; without it the app uses the heavily rate-limited `DEMO_KEY`. Get a key at https://fdc.nal.usda.gov/api-key-signup.
- `EXPO_PUBLIC_API_URL`: optional native client API origin, for example a LAN URL to the Expo Router server.

Keep local `.env` files out of git. The server returns clear JSON errors when AI configuration is missing.

## Commands

- `npm install`
- `npx expo start`
- `npx tsc --noEmit`
