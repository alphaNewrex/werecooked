# We're Cooked! design system

## Source of truth

The runtime token source is [`lib/design/tokens.js`](lib/design/tokens.js). `global.css` is generated from it with `npm run tokens`; do not hand-edit generated variables.

Direction A is **Market Stall**: useful pantry information presented with fresh produce color, clear type, and small PLU-like stickers.

## Principles

- Make the next cooking decision obvious.
- Use hierarchy before decoration: display type for the moment, body type for the explanation, mono type for quantities and status.
- Prefer semantic tokens (`bg`, `surface`, `text-muted`, `success`, `warning`, `primary`) over raw values.
- Keep cards calm and controls tactile. The produce-sticker signature is reserved for statuses, prices, and diet chips.
- Preserve useful copy and accessibility labels when reshaping a screen.

## Voice and copy

- Use sentence case.
- Name the action with a specific verb: “Add to pantry”, “Start cooking”, “Open original reel”.
- Errors say what happened and how to fix it.
- Keep labels short and concrete. Avoid system language, filler, and vague apologies.
- Keep accessibility labels stable when a visual label changes.

## Tokens

Colors, type roles, radii, icon sizes, elevation, and motion values live in [`lib/design/tokens.js`](lib/design/tokens.js). Use `useTheme()` for resolved native values and Tailwind semantic names for layout styles.

| Role | Use |
| --- | --- |
| `bg` | Screen background |
| `surface` | Cards and sheets |
| `surface-muted` | Inputs, wells, secondary controls |
| `surface-raised` | Dialogs and toasts |
| `text`, `text-muted`, `text-subtle` | Primary, secondary, and disabled copy |
| `primary` | Main action and need state |
| `success` | Have state |
| `warning` | Partial and price state |
| `danger` | Errors and destructive actions |

Type roles are `display-xl`, `display-lg`, `display-md`, `title`, `body-lg`, `body`, `body-strong`, `body-sm`, `caption`, `label`, `numeric`, and `numeric-sm`.

## Motion

- Durations: instant `0`, fast `120`, base `220`, slow `360`, deliberate `520` ms.
- Curves: standard, enter, exit, and linear are tokenized cubic-bezier curves.
- Springs: snappy `{ damping: 20, stiffness: 300, mass: 1 }`, smooth `{ damping: 26, stiffness: 180, mass: 1 }`, bouncy `{ damping: 12, stiffness: 180, mass: 1 }`.
- Presses use scale `0.97` and opacity `0.9` with the snappy spring.
- Use `enterAnimation`, `exitAnimation`, and `layoutTransition` for mounted lists and layout changes.
- Use `useHaptics()` for selection, light, success, warning, and error feedback.
- Reduced motion uses opacity-only transitions of at most 120 ms and never loops.

## Components

### Layout

Use `Screen`, `ScreenHeader`, `Section`, `ListRow`, and `EmptyState` for screen structure. `Screen` owns the background, gutter, scroll behavior, and footer inset.

### Patterns

Use `RecipeCard`, `LibraryEntryCard`, `IngredientRow`, `PriceTag`, and `HaveNeedMeter` for product-specific content. Keep have/partial/need states semantic; do not recreate their colors locally.

### Primitives

Use `Text`, `Icon`, `Pressable`, `Button`, `IconButton`, `FAB`, `Card`, `Sticker`, `Chip`, `Badge`, `Input`, `Separator`, `Skeleton`, `Avatar`, `ProgressMeter`, `Stepper`, `NumberStepper`, `Notice`, and `SyncIndicator`.

Do:

- Use a token tone or semantic Tailwind class.
- Use `Sticker` for status, price, and diet labels.
- Use `Notice` for inline errors and `useFeedback()` for transient feedback and confirmation.
- Keep test IDs and accessibility labels stable.

Do not:

- Add hex colors, arbitrary Tailwind values, or custom font-weight utilities.
- Import `Animated` from `react-native`; use Reanimated and the motion helpers.
- Call `Alert.alert`, browser `confirm`, or a raw toast from a screen.
- Add visual class overrides to primitives except layout concerns.

## Enforcement

`npm run lint` rejects hex literals, arbitrary Tailwind values, font-weight utilities, `react-native` Animated imports, `Alert.alert`, and raw `confirm()` calls in app/components/lib code. `npm run tokens:check` detects drift between the token source and generated CSS.
