# CookFood

CookFood helps you turn what is already in your kitchen — or a recipe saved from a social reel — into dinner. Add pantry items by hand or scan a photo, ask for ranked recipe suggestions, then see one recipe view with pantry matches, missing-item price estimates, cooking steps, and a grocery handoff.

Start with `npm install`, copy `.env.example` to `.env`, set `AI_MODEL` plus the matching provider key, and run `npx expo start`. Typecheck with `npx tsc --noEmit`. The Expo Router server routes are under `app/api/`; the app is intentionally local-first for pantry storage.

The recommended provider is Azure AI Foundry: set `AI_MODEL=azure:<deployment-name>`, where the model id is the Foundry **deployment name**, plus `AZURE_API_KEY` and either `AZURE_RESOURCE_NAME` or `AZURE_BASE_URL` (the base URL wins when both are present). The Azure deployment must support vision/image input and structured JSON output because pantry scans and reel screenshots send images and require typed recipes. OpenAI, Anthropic, and Google remain available as alternatives in `.env.example`.

Pantry macro lookups use USDA FoodData Central. Set `USDA_API_KEY` for normal limits; without it, the app falls back to the heavily rate-limited `DEMO_KEY`. Request a key at https://fdc.nal.usda.gov/api-key-signup.

Missing recipe ingredients can use real Kroger product prices when `KROGER_CLIENT_ID`, `KROGER_CLIENT_SECRET`, and `KROGER_ZIP` are configured. Register an app at https://developer.kroger.com in the **Production** environment and request the Products API `product.compact` scope. CookFood uses product search only; it does not create carts or require user OAuth.

## Share from Instagram

CookFood runs in Expo Go, so the iPhone share-sheet integration uses an iOS Shortcut rather than a native share extension. Copy the selectable **Shortcut link** shown in the Reel tab. In the **Shortcuts** app:

1. Choose **New Shortcut** and name it **CookFood**.
2. Open **Details/info**, enable **Show in Share Sheet**, and accept **URLs and Text**.
3. Add **URL Encode** using **Shortcut Input**.
4. Add a **Text** action containing `<shortcut link shown in app>?url=` followed by the **URL Encoded Text** magic variable.
5. Add **Open URLs**.

Share an Instagram reel to CookFood. The app opens the Reel tab with the URL, reads the caption, and uses the screenshot picker as a fallback if Instagram does not expose a caption. The shortcut base changes when the Mac IP changes.
