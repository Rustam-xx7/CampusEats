---
name: CSJMU Campus Dining
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5ce'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e3'
  surface-container-high: '#fbe3dc'
  surface-container-highest: '#f5ddd7'
  on-surface: '#251915'
  on-surface-variant: '#5b403d'
  inverse-surface: '#3b2d29'
  inverse-on-surface: '#ffede8'
  outline: '#8f706c'
  outline-variant: '#e4beba'
  surface-tint: '#b91d20'
  primary: '#a20513'
  on-primary: '#ffffff'
  primary-container: '#c62828'
  on-primary-container: '#ffe0dd'
  inverse-primary: '#ffb4ac'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#504f4c'
  on-tertiary: '#ffffff'
  tertiary-container: '#696764'
  on-tertiary-container: '#eae6e2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#93000e'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#e5e2de'
  tertiary-fixed-dim: '#c9c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#484744'
  background: '#fff8f6'
  on-background: '#251915'
  surface-variant: '#f5ddd7'
typography:
  headline-hero:
    fontFamily: Bebas Neue
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: 0.04em
  headline-hero-mobile:
    fontFamily: Bebas Neue
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 38px
    letterSpacing: 0.04em
  headline-lg:
    fontFamily: Bebas Neue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Bebas Neue
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0.02em
  headline-sm:
    fontFamily: Bebas Neue
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.02em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-price:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '800'
    lineHeight: 20px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system defines a warm, appetite-inducing, and tactile digital ordering experience for university campus dining. Designed specifically for active students, faculty, and campus staff, the system bridges the speed of quick-service food ordering with the comforting warmth of a collegiate culinary hub.

### Aesthetic Movement
The design movement pairs **Tactile Warm Minimalism** with **Fast-Casual Editorial Boldness**:
- **Soft-UI & Warm Surfaces:** Eliminates aggressive black strokes and harsh borders. Depth is instead established through soft-lit off-white card surfaces set against a soothing, creamy backdrop.
- **Expressive Collegiate Energy:** Balances soft, friendly surfaces with high-impact, condensed uppercase typography and deep crimson accents, evoking university pride, immediacy, and energetic appetite.
- **Organic Friendliness:** Pill-shaped controls, oversized radii, and tactile, thumb-friendly tap targets make high-rush pre-orders between lectures effortless and delightful.

## Colors

The palette is anchored in rich, warm culinary hues that stimulate appetite while remaining grounded and legible under diverse campus lighting environments.

### Roles & Harmonies
- **Background (`#F5EBDD`):** A soft, comforting warm cream canvas that removes the clinical glare of pure white screens.
- **Surface Tier (`#FFFBF7`):** Elevated cards, input pills, and content sheets use a clean off-white to contrast gracefully against the cream base.
- **Primary Accent (`#C62828`):** Deep Crimson Red drives critical conversions—primary action buttons, total pricing indicators, active selection pills, cart counters, and hero marketing surfaces.
- **Secondary Highlight (`#F5A623`):** Warm gold/amber reserves itself for ratings, chef specials, order status milestones, and loyalty stamps.
- **Primary Content (`#2B1E1A`):** Deep charcoal espresso guarantees high-contrast legibility for titles and primary labels without the harshness of pure `#000000`.
- **Secondary Content (`#7D6E68`):** Warm muted brown-gray handles item descriptions, metadata, inactive tab states, and supportive text.

## Typography

The typography couples the punchy, high-energy impact of **Bebas Neue** with the contemporary, warm, and highly legible geometry of **Plus Jakarta Sans**.

### Usage Guidelines
- **Headlines & Banners (`Bebas Neue`):** Always rendered in full uppercase with subtle positive letter spacing (`0.02em` - `0.04em`). Used exclusively for marketing statements, meal section categories ("POPULAR PICKS", "DAILY THALI", "BEVERAGES"), and promotional card callouts.
- **Body & Product Content (`Plus Jakarta Sans`):** Provides clarity for item names, caloric/dietary details, order customization forms, and live status updates.
- **Numeric Pricing:** Set using `label-price` with an extra bold weight to guarantee rapid scanning in fast-moving campus environments.

## Layout & Spacing

The layout is built primarily around a mobile-first viewport with generous vertical breathing room and edge-to-edge modular containers.

### Grid & Density Rules
- **Mobile Handheld (Primary Target):** Single fluid column with fixed side gutters (`1.25rem` / `20px`) ensuring elements stay well clear of hardware edges while preserving large hit targets for single-thumb interactions.
- **Horizontal Scrolling Trays:** Food categories and popular items live in horizontal snap-carousels that bleed past screen edges to signal discoverability.
- **Component Padding Rhythms:** Internal card padding defaults to `1rem` (`space-md`) on standard item cards, extending to `1.5rem` (`space-lg`) on hero banners and modals.

## Elevation & Depth

This design system avoids structural outlines and pitch-black drop shadows. Depth is achieved entirely through warm ambient diffusion and tonal shifts.

### Elevation Hierarchy
- **Level 0 (Canvas Base):** Background color `#F5EBDD`. Flat and matte.
- **Level 1 (Resting Cards & Inputs):** Surface `#FFFBF7` elevated by a soft, warm tinted shadow: `0px 4px 16px rgba(138, 98, 77, 0.08)`. This creates an extruded, pillowy surface that feels organic and touchable.
- **Level 2 (Hovered / Active Cards & Floating Banners):** Elevated via `0px 8px 24px rgba(138, 98, 77, 0.12)`.
- **Level 3 (Floating Bottom Nav & Overlays):** Uses an ambient diffuse blur: `0px 12px 36px rgba(66, 38, 26, 0.16)` alongside a subtle top specular glow (`1px solid rgba(255, 255, 255, 0.6)`).
- **Hero Red Surface:** Primary red elements (`#C62828`) cast a specialized crimson glow: `0px 8px 20px rgba(198, 40, 40, 0.28)`.

## Shapes

The visual language is defined by friendly, high-radius curves and fluid pill silhouettes.

### Radius Specifications
- **Full Pill (`rounded-full` / `9999px`):** Applied to all CTA buttons, category filter pills, search bars, stepper handles, and floating indicator tags.
- **Cards & Banners (`24px` - `28px`):** Food item cards, hero promo banners, and modal dialogs use an exaggerated `24px` to `28px` radius to reinforce the comforting, tactile aesthetic.
- **Thumbnail Images (`18px` - `20px`):** Food imagery within cards is clipped with smooth inner radii harmonizing with the parent card.

## Components

### Pill Search Bar
- **Surface:** Off-white (`#FFFBF7`) pill with 52px total height.
- **Leading & Trailing:** Location indicator icon and custom search icon in primary crimson (`#C62828`) or espresso (`#2B1E1A`).
- **Shadow:** Warm ambient diffused shadow (`0px 4px 14px rgba(138, 98, 77, 0.07)`), no outer stroke.

### Category Chips
- **Inactive:** `#FFFBF7` container with subtle warm shadow. Features category icon centered above a short `label-md` text label in `#7D6E68`.
- **Active / Selected:** Crimson filled pill (`#C62828`) or soft cream outline with crimson icon and bold text.

### Food Item Cards (Catalog Grid)
- **Structure:** Vertical or horizontal off-white `#FFFBF7` card with 24px rounded corners.
- **Imagery:** High-contrast transparent or warm-lit circular/rounded food photography protruding slightly or centered at the top.
- **Content:** Title in `title-sm` espresso, subtle calories or portion note in `body-sm` muted brown, and price in bold `label-price` crimson (`#C62828`).
- **Quick-Add CTA:** Circular 36px crimson button (`#C62828`) containing a crisp white plus (`+`) icon located in the bottom-right corner.

### Stepper Counter
- **Structure:** Compact pill container in `#F5EBDD` with dual circular interactive triggers (`-` and `+`).
- **Center:** Bold quantitative number set in `label-price` espresso.
- **State Feedback:** Smooth micro-scale reduction on press.

### Floating Bottom Navigation & Raised Cart Bubble
- **Navigation Dock:** Pill-shaped bar floating 16px above the home indicator, styled in off-white (`#FFFBF7`) with Level 3 ambient shadow.
- **Nav Items:** Clean minimalist icons with label text for Home, Menu, Rewards, and Profile. Active state indicated with `#C62828`.
- **Raised Center Cart Bubble:** Elevated circular crimson bubble (`#C62828`) positioned at center-stage, breaking the top boundary of the dock. Houses a white shopping cart icon with a gold (`#F5A623`) circular badge indicating item count.

### Order Tracking & Kanban Cards
- **Kanban Order Card:** Segmented into "Received", "In Kitchen", and "Ready at Counter". Clear large pickup token number set in `headline-lg` (`#2B1E1A`).
- **Live Tracking Stepper:** Warm amber-gold (`#F5A623`) progressing to crimson (`#C62828`) as the meal completes, linked by smooth continuous 4px tracking lines.