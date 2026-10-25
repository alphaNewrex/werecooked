# Design tokens — Direction A · Market Stall (authoritative)

## Color (semantic)
| token | light | dark | notes |
|---|---|---|---|
| bg | #F6F7F1 | #101712 | app background |
| surface | #FFFFFF | #18221B | cards, sheets |
| surface-muted | #EDF0E8 | #1F2B22 | inputs, wells, segmented bg |
| surface-raised | #FFFFFF | #223026 | dialogs, toasts, popovers |
| text | #16211A | #EEF2EA | primary text |
| text-muted | #5D6B61 | #9DAA9F | secondary text (≥4.5:1 on surface) |
| text-subtle | #7C887F | #75827A | placeholders, disabled only (not body text) |
| border | #DCE3D8 | #2A362D | hairlines, card borders |
| border-strong | #C4CEC0 | #3A483E | input borders, dividers that must read |
| primary | #E8482A | #FF6A4D | tomato: primary actions, "need" |
| on-primary | #FFFFFF | #1A0F0B | text/icons on primary |
| primary-soft | #FDE3DC | #3A1E17 | need tints |
| primary-ink | #B2321A | #FF9A85 | text on primary-soft |
| success | #2F8F4E | #5BC27C | leaf: "have" |
| success-soft | #DCEFE2 | #1C3324 | |
| success-ink | #1E6A37 | #8EDBA6 | text on success-soft |
| warning | #F4C842 | #F7D560 | butter: "partial", price |
| warning-soft | #FCF3CF | #3A3216 | |
| warning-ink | #6B5200 | #F7D560 | text on warning-soft |
| danger | #C8243B | #FF5C77 | raspberry: errors, destructive (never tomato) |
| danger-soft | #F9DDE1 | #3D1A21 | |
| danger-ink | #A01D30 | #FF8A9C | |
| info | #2D6FB7 | #6FA8EA | sync, neutral notices |
| info-soft | #DCE9F7 | #182A3D | |
| info-ink | #1F528A | #A9CBF2 | |
| scrim | rgba(16,23,18,0.45) | rgba(0,0,0,0.6) | modal backdrop |

Product aliases: `have`→success, `partial`→warning, `need`→primary, `price`→warning, `staple`→surface-muted/text-muted.

## Type roles (font file, size/line-height px, letter-spacing px)
| role | font | size/lh | tracking | case |
|---|---|---|---|---|
| display-xl | YoungSerif_400Regular | 34/40 | -0.2 | |
| display-lg | YoungSerif_400Regular | 28/34 | -0.2 | |
| display-md | YoungSerif_400Regular | 22/28 | -0.1 | |
| title | DMSans_700Bold | 20/26 | 0 | |
| body-lg | DMSans_400Regular | 17/24 | 0 | |
| body | DMSans_400Regular | 15/22 | 0 | |
| body-strong | DMSans_700Bold | 15/22 | 0 | |
| body-sm | DMSans_400Regular | 13/18 | 0 | |
| caption | DMSans_500Medium | 12/16 | 0 | |
| label | IBMPlexMono_500Medium | 11/14 | 1.2 | uppercase |
| numeric | IBMPlexMono_500Medium | 15/20 | 0 | tabular-nums |
| numeric-sm | IBMPlexMono_400Regular | 12/16 | 0 | tabular-nums |
Never use fontWeight with custom fonts; weight = font file.

## Spacing
4-pt Tailwind default scale; allowed steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16. Screen gutter = 5 (20 px). Card padding = 4 (16 px). Section gap = 6 (24 px). Row gap = 3 (12 px).

## Radius
sm 8 · md 12 · lg 16 · xl 24 · full 9999. Controls (buttons, chips, inputs, steppers) = full; cards = lg; sheets/dialogs = xl; small tags/wells = md.

## Icons
sm 16 · md 20 · lg 24 · xl 32. Stroke 2 (2.2 for tab bar).

## Elevation
- none
- card: shadowColor text, opacity 0.06, radius 8, offset y 2; Android elevation 1
- raised: opacity 0.10, radius 16, offset y 6; elevation 4
- overlay: opacity 0.18, radius 28, offset y 12; elevation 8
Dark mode: shadows at half opacity; surfaces separate by surface-raised color instead.

## Motion
Durations: instant 0, fast 120, base 220, slow 360, deliberate 520 (ms).
Curves (cubic-bezier): standard (0.2,0,0,1); enter (0.05,0.7,0.1,1); exit (0.3,0,0.8,0.15); linear.
Springs: snappy {damping 20, stiffness 300, mass 1}; smooth {26,180,1}; bouncy {12,180,1}. Direction A default = smooth; bouncy for stickers landing and celebrations.
Haptics: selection, light, success, warning, error.
Press: scale 0.97 + opacity 0.9, snappy. Exits use ~70% of enter duration.
Reduced motion: opacity-only, ≤ fast, no loops, timings instead of springs; haptics unchanged.

## Signature: produce stickers
`Sticker` component: oval (radius full), tinted soft fill + ink text in `label` or `numeric-sm` role, rotation deterministic from a hash of its label in [-2°, 2°] (0° when reduced motion is on is NOT required — rotation is static). Used for have/partial/need/staple status, price tags, time badge, diet chips (unselected stickers are surface-muted). Lands with bouncy scale 0.8→1 when first shown in a list.
