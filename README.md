# CookFood

CookFood helps you turn what is already in your kitchen — or a recipe saved from a social reel — into dinner. Add pantry items by hand or scan a photo, ask for ranked recipe suggestions, then see one recipe view with pantry matches, missing-item price estimates, cooking steps, and a grocery handoff.

Start with `npm install`, copy `.env.example` to `.env`, set `AI_MODEL` plus the matching provider key, and run `npx expo start`. Typecheck with `npx tsc --noEmit`. The Expo Router server routes are under `app/api/`; the app is intentionally local-first for pantry storage.

## Share from Instagram

CookFood runs in Expo Go, so the iPhone share-sheet integration uses an iOS Shortcut rather than a native share extension. Copy the selectable **Shortcut link** shown in the Reel tab. In the **Shortcuts** app:

1. Choose **New Shortcut** and name it **CookFood**.
2. Open **Details/info**, enable **Show in Share Sheet**, and accept **URLs and Text**.
3. Add **URL Encode** using **Shortcut Input**.
4. Add a **Text** action containing `<shortcut link shown in app>?url=` followed by the **URL Encoded Text** magic variable.
5. Add **Open URLs**.

Share an Instagram reel to CookFood. The app opens the Reel tab with the URL, reads the caption, and uses the screenshot picker as a fallback if Instagram does not expose a caption. The shortcut base changes when the Mac IP changes.
