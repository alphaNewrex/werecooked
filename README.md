# CookFood

CookFood helps you turn what is already in your kitchen — or a recipe saved from a social reel — into dinner. Add pantry items by hand or scan a photo, ask for ranked recipe suggestions, then see one recipe view with pantry matches, missing-item price estimates, cooking steps, and a grocery handoff.

Start with `npm install`, copy `.env.example` to `.env`, set `AI_MODEL` plus the matching provider key, and run `npx expo start`. Typecheck with `npx tsc --noEmit`. The Expo Router server routes are under `app/api/`; the app is intentionally local-first for pantry storage.
