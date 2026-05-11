---
name: Sello Protocol
colors:
  surface: '#171308'
  surface-dim: '#171308'
  surface-bright: '#3e392c'
  surface-container-lowest: '#120e04'
  surface-container-low: '#1f1b10'
  surface-container: '#241f13'
  surface-container-high: '#2e2a1d'
  surface-container-highest: '#393427'
  on-surface: '#ebe1cf'
  on-surface-variant: '#e6bdb7'
  inverse-surface: '#ebe1cf'
  inverse-on-surface: '#353023'
  outline: '#ad8883'
  outline-variant: '#5d3f3b'
  surface-tint: '#ffb4a9'
  primary: '#ffb4a9'
  on-primary: '#690002'
  primary-container: '#cc1512'
  on-primary-container: '#ffdeda'
  inverse-primary: '#bf0409'
  secondary: '#d8b9ff'
  on-secondary: '#450086'
  secondary-container: '#7505db'
  on-secondary-container: '#dbbdff'
  tertiary: '#00e38b'
  on-tertiary: '#00391f'
  tertiary-container: '#007646'
  on-tertiary-container: '#77ffb2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4a9'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930004'
  secondary-fixed: '#eddcff'
  secondary-fixed-dim: '#d8b9ff'
  on-secondary-fixed: '#290055'
  on-secondary-fixed-variant: '#6300bb'
  tertiary-fixed: '#56ffa8'
  tertiary-fixed-dim: '#00e38b'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#171308'
  on-background: '#ebe1cf'
  surface-variant: '#393427'
typography:
  display-lg:
    fontFamily: Bebas Neue
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-label:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  container-max: 1280px
---

## Brand & Style

This design system establishes a **Tactile / Vintage Club** aesthetic, blending the romanticism of early 20th-century correspondence with high-performance blockchain technology. It evokes the feeling of a prestigious, secret society where every transaction is treated as a piece of signed history—a "postal protocol" for the modern era.

The visual identity centers on the "Postal Stamp" metaphor. Interfaces are treated as surfaces—leather desks, aged paper, and lacquered ink. The style utilizes **Physical Skeuomorphism** combined with **Art Deco structuralism**, featuring serrated edges, rubber stamp textures, and wax seal motifs. It is designed to feel permanent, authoritative, and artisanal, contrasting the ephemeral nature of digital assets with the grit and weight of a physical archive.

## Colors

The palette is anchored in **Warm Ink Black** and **Leather Brown**, creating a low-light, premium environment reminiscent of a private library. 

- **Vintage Stamp Red (#CC1512):** Used for primary actions, critical alerts, and brand motifs (like airmail stripes). It should feel like dried pigment rather than a digital glow.
- **Solana Neons (#9945FF, #14F195):** Used sparingly as "technological ink" for data visualization and success states, bridging the vintage aesthetic with crypto-native roots.
- **Vintage Gold (#C9A84C):** Reserved for decorative ornaments, Art Deco borders, and "Verified" statuses.
- **Aged White (#F0E6D3):** The primary reading color, providing soft contrast that reduces eye strain compared to pure white.

## Typography

This design system uses a hierarchical typographic mix to distinguish between narrative and technical data:

- **Display & Logo:** `Bebas Neue` provides the WPA-poster impact. Use all-caps with generous tracking for titles and section headers.
- **Headlines:** `Playfair Display` conveys luxury and editorial authority.
- **Body Copy:** `Newsreader` is used for long-form text, providing a literary, "typed" feel.
- **Technical Data:** `Work Sans` and `JetBrains Mono` are used for wallet addresses, transaction hashes, and UI labels where clarity is paramount.

**Scaling:** On mobile devices, `display-lg` should scale down to 40px and `headline-lg` to 28px to ensure legibility within narrow margins.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy within a centered container, mimicking the structured layout of a postcard or a formal ledger.

- **Grid:** A 12-column system for desktop with 24px gutters. Elements should align to the grid but feel free to "break" the grid with decorative elements like overlapping stamps or seals.
- **Margins:** Large outer margins emphasize the "card-on-desk" feel.
- **Rhythm:** Spacing follows a 4px base unit. Use generous padding inside card surfaces (min 32px) to reflect the spaciousness of high-end stationery.
- **Responsive:** On mobile, switch to a 4-column grid. Remove large outer margins to maximize screen real estate, but retain the internal card padding to keep the "object" feel.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Physical Texture** rather than standard shadows.

- **Base Layer:** The `warm ink black` background features a faint, non-scrolling paper grain texture.
- **Surface Layer:** Card containers use `leather brown` or `deep black`. They do not use shadows; instead, they use **Art Deco corner ornaments** in `vintage gold` to define their boundaries.
- **Stamps & Badges:** Elements like status tags use a "perforated edge" mask to appear as postage stamps. These sit "on top" of the surface with a very tight, high-opacity 2px offset shadow to simulate a paper edge.
- **The "Glass" Exception:** When overlays (modals) are used, use a high-blur backdrop filter with a subtle `leather brown` tint to maintain the warm, dark atmosphere.

## Shapes

The design system utilizes **Sharp (0px)** corners for the primary containers and buttons to maintain the Art Deco and WPA aesthetic. 

- **Serrated Edges:** Badges and tags must use a custom CSS mask or SVG border-image to create a "stamp" zigzag edge.
- **Decorative Frames:** Use 1px or 2px solid strokes for internal dividers. 
- **The Wax Seal:** Circles are reserved exclusively for "Wax Seal" components (floating action buttons or brand marks), which should feature a slight irregular, organic edge.

## Components

- **Buttons:** Styled as **Rubber Stamps**. They feature no rounded corners, a 2px solid border, and a slightly distressed, inner-shadow "stamped" effect on click. Labels are always all-caps `Bebas Neue`.
- **Cards:** These are the "Postcards." Use `leather brown` backgrounds. The top-right corner should be reserved for "Stamp" status badges.
- **Airmail Divider:** A decorative horizontal rule consisting of alternating diagonal `stamp red` and `ink black` stripes (approx. 8px wide). Use this to separate major sections.
- **Input Fields:** Styled as underlined ledger lines or "Fill-in-the-blank" boxes with a subtle `deep black` fill and `muted brown` borders.
- **Badges:** Use the serrated stamp edge. Successful transactions use the `Solana green` ink; pending uses `vintage gold`.
- **Corner Ornaments:** Use L-shaped Art Deco geometric patterns in the corners of primary containers to provide structural elegance.