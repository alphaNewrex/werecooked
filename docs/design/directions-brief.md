# Design direction round — brief

Subject: **We're Cooked!** — for people who save cooking reels and never cook them. One job: get from "saved reel" to "dinner tonight" with what's already in the kitchen. Voice: playful about the name, plain and specific everywhere else.

Every direction renders the **same sample set** with the same real content, in light and dark:

1. Screen header: "Pantry" + subtitle "18 items · synced"
2. Recipe card: "Chili Crunch Chicken Tenders", 40 min, serves 4, have/partial/need meter (4 have · 1 partial · 9 need), CTA "View recipe"
3. Ingredient rows:
   - have: "Chicken breast" — "2 lb" — "In pantry"
   - partial: "All-purpose flour" — "2 cups" — "Have ½ cup · buy 1½ cups"
   - need: "Cornstarch" — "½ cup" — price tag "Kroger $2.19 · 16 oz box"
   - staple: "Salt" — "to taste"
4. Reel job card mid-progress: creator "@crispy.kitchen", stage 3 of 6 "Reading the creator's comments…", elapsed "0:42", Cancel. Animated: loop through stages every 1.6 s, then a "done" state.
5. Servings stepper: "Servings 4" with − / +
6. Buttons: primary "Add to cart", secondary "Start cooking", ghost "Open original reel", danger "Delete account"
7. Input: "Ingredient name" with leading icon + quantity input "2 | lb"
8. Chips: "Vegetarian" (selected), "Gluten-free", "Nut allergy"
9. Toast: "Added 9 items to cart" with "Undo"
10. Error notice: title "Couldn't read this reel", body "Add a screenshot and we'll read the text from it."

## Direction A — Market Stall (evolution of today)
- Thesis: a farmers-market stall: fresh produce colors, produce-sticker labels.
- Palette light: bg `#F6F7F1`, surface `#FFFFFF`, ink `#16211A`, muted `#5D6B61`, border `#DCE3D8`, leaf (have) `#2F8F4E`, butter (partial/price) `#F4C842`, tomato (primary/need) `#E8482A`, danger `#C8243B` (raspberry, distinct from tomato).
- Palette dark: bg `#101712`, surface `#18221B`, ink `#EEF2EA`, muted `#9DAA9F`, border `#2A362D`, leaf `#5BC27C`, butter `#F7D560`, tomato `#FF6A4D`, danger `#FF5C77`.
- Type: Bricolage Grotesque 800 display (headers only), DM Sans body, IBM Plex Mono numerics/labels.
- Shape: cards 16, controls full pill.
- Signature: **produce-sticker chips** — have/partial/need and price shown as small oval stickers with a slight rotation (−2°..2°), like PLU stickers on fruit.
- Motion character: soft-bouncy (smooth spring default, bouncy for stickers landing).

## Direction B — Enamel Kitchen
- Thesis: tactile enamel cookware and appliance dials; quantities and timers are first-class.
- Palette light: bg `#F2F4F8` (cool porcelain), surface `#FFFFFF`, ink `#121A2E`, muted `#5A6378`, border `#D9DEE8`, cobalt (primary) `#2446C8`, mint (have) `#1F9D6B`, amber (partial/price) `#F2A516`, coral (need) `#EF6A3A`, danger `#C21F4A`.
- Palette dark: bg `#0D1220`, surface `#161D30`, ink `#EEF1F8`, muted `#9AA3B8`, border `#263049`, cobalt `#6F8BFF`, mint `#3FCB93`, amber `#FFC247`, coral `#FF8A5C`, danger `#FF5A7E`.
- Type: Unbounded 700 display (wide, rounded), Figtree body, JetBrains Mono numerics.
- Shape: cards 20, controls 14, steppers as round knobs.
- Signature: **burner-ring progress** — reel job stages and the have/need meter drawn as a segmented ring like a stove burner; servings stepper styled as a dial.
- Motion character: mechanical-snappy (snappy springs, low overshoot, selection haptics on every detent).

## Direction C — Group Chat
- Thesis: leans into the name; the app talks like the friend who sent you the reel.
- Palette light: bg `#F7F3FF` (pale lavender), surface `#FFFFFF`, ink `#22142E` (eggplant), muted `#6B5C7A`, border `#E4DAF2`, chili (primary/need) `#FF4A1C`, basil (have) `#1E9E5A`, yolk (partial/price) `#FFB800`, danger `#D1123F`.
- Palette dark: bg `#140B1C`, surface `#20142B`, ink `#F5EFFC`, muted `#B3A3C4`, border `#352645`, chili `#FF6B42`, basil `#41C97F`, yolk `#FFCB3D`, danger `#FF4D6D`.
- Type: Shrikhand display (used only for the screen title and the "done" moment), Plus Jakarta Sans body, JetBrains Mono numerics.
- Shape: cards 24 with one squared corner (speech-bubble tail corner), controls pill.
- Signature: **"How cooked are we?" heat meter** — have/need shown as a flame gauge from "Fully stocked" to "We're cooked"; reel job progress shown as chat-style status bubbles ("Listening to the chef…").
- Motion character: bouncy, expressive (bouncy springs on bubbles arriving, typing-dots shimmer).

## Delivery
- Throwaway dev route `app/dev/directions.tsx`: top segmented control A / B / C, light/dark toggle, then the sample set. Direction tokens live in `lib/design/directions/*.ts`. Prototype code is deleted after the pick.
- Captures at 430×932 on web: `docs/design/directions/{a,b,c}-{light,dark}.png` (full-page) and `{a,b,c}-job.webm` → mp4 (6 s of the job card animating).
