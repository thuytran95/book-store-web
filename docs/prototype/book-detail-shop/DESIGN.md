---
name: Serene Botanical Editorial
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#404945'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#707974'
  outline-variant: '#c0c9c3'
  surface-tint: '#376757'
  primary: '#003629'
  on-primary: '#ffffff'
  primary-container: '#1b4d3e'
  on-primary-container: '#8abda9'
  inverse-primary: '#9ed1bd'
  secondary: '#006c48'
  on-secondary: '#ffffff'
  secondary-container: '#92f7c3'
  on-secondary-container: '#00734d'
  tertiary: '#472700'
  on-tertiary: '#ffffff'
  tertiary-container: '#673a00'
  on-tertiary-container: '#f3a045'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeed9'
  primary-fixed-dim: '#9ed1bd'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#1d4f40'
  secondary-fixed: '#92f7c3'
  secondary-fixed-dim: '#75daa8'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#ffb870'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1.25rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses a serene, thoughtful, and tactile digital reading sanctuary. Drawing direct visual inspiration from modern curated bookstore experiences and the reference imagery, the interface combines organic calmness with precise, contemporary editorial restraint.

The style merges **soft minimalism** with **tactile physical lightness**. Instead of cold, sterile grays and harsh borders, the environment uses gentle eucalyptus mist washes, warm paper whites, and cushioned, pill-shaped tactile surfaces. The emotional atmosphere evokes a tranquil afternoon in a sunlit boutique bookstore: quiet, uncluttered, inspiring, and comfortable for extended browsing and immersive reading.

## Colors

The palette is anchored by deep botanical greens, delicate sage washes, and luminous warm neutrals, accented with honey ochre for high-value focal points like pricing, star ratings, and subtle highlights.

### Semantic Mapping & Usage

- **Primary (`#1B4D3E` / Deep Pine):** The anchor for primary calls-to-action ("Buy Now", active tab states, selection pills), imparting weight, trust, and premium restraint. Text on primary surfaces is pure white (`#FFFFFF`).
- **Secondary (`#52B788` / Fresh Sage):** Used for interactive iconography, vibrant badges, subheadings, and soft highlight rings.
- **Tertiary (`#E6953B` / Warm Honey Ochre):** Reserved for contextual delight, book star ratings, currency/pricing emphasis, and curated staff picks.
- **Backgrounds & Canvas:**
  - Base canvas: `#F4F6F4` (gentle eucalyptus off-white) to avoid glare.
  - Surface elevations: `#FFFFFF` (crisp card base).
  - Tonal backing pods: Tinted pastel blocks such as `#EBF3ED` (soft mint), `#FCEEDB` (honey mist), `#F2EFF8` (lavender mist), and `#E8EFF7` (sky mist) to frame book artwork naturally.
- **Text & Neutral Palette:**
  - Primary text: `#1F2937` (slate ink) ensures crisp legibility without stark blackness.
  - Secondary text / Authors: `#6B7280` (cool slate gray).
  - Muted labels / borders: `#E5E7EB` and `#D1D5DB`.

## Typography

The type system relies on **Plus Jakarta Sans** throughout, utilizing its geometric warmth, open apertures, and welcoming humanist proportions. 

- **Titles & Display:** Bold weights (`700`) paired with subtle negative letter spacing (`-0.02em`) deliver editorial punch while remaining approachable.
- **Metadata & Authorship:** Light and regular weights with balanced leading guarantee book titles remain prominent while secondary attributions ("By Alan Trotter") rest quietly below.
- **Micro-Copy & Prices:** Bold, compact labels in ochre or deep pine ensure instant scannability for monetary values, ratings, and pill labels.

## Layout & Spacing

Layouts follow a fluid, human-scaled rhythm designed around mobile-first thumb zones and adaptive grid spans:

- **Mobile Viewports (< 640px):** Single-column layout with 2-column horizontal scrolling carousels for showcases. Outer page margin is set to `1.25rem` (`20px`) with continuous vertical flow separated by `1.5rem` section buffers.
- **Tablet / Large Screens (≥ 640px to 1024px):** 6-column fluid grid, `1.25rem` gutters, translating book shelves into structured modular grids.
- **Desktop (≥ 1024px):** 12-column layout capped at a maximum reading container width of `1200px`, centered with `margin-desktop` of `3rem`.
- **Card Internals:** Strict component padding using `space-md` (`1rem`) internally, while book cover hero stages expand to `space-lg` (`1.5rem`) for generous visual breathing room.

## Elevation & Depth

This system adopts **ambient tinted shadows** and **tonal layered surfaces** to evoke weightless, physical paper craft without stark skeuomorphism:

- **Surface Base:** Flat canvas backdrop (`#F4F6F4`) sits at base elevation 0.
- **Card Pods & Panels (Elevation 1):** Floating white cards or soft tinted mats utilize an ultra-diffused, botanical-tinted drop shadow:
  `box-shadow: 0 8px 24px -4px rgba(27, 77, 62, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03);`
  This eliminates harsh grey shadows in favor of a soft, luminous green-tinted depth.
- **Book Display Pods:** Inner colored rounded rectangles (mint, honey, lavender) sit flat within the parent card, letting physical book covers cast their own localized micro-shadow:
  `box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.16);`
- **Floating Controls & Action Bars (Elevation 2):** Floating circular navigation icons (back, bookmark, search) and bottom action bars apply:
  `box-shadow: 0 12px 32px -6px rgba(27, 77, 62, 0.08);`
- **Borders:** No heavy stroke borders are used. Separation relies entirely on subtle tonal shifts (`#EBF3ED` vs `#FFFFFF`) and ambient light.

## Shapes

The interface embraces a hyper-smooth, **pill-forward shape philosophy** (Level 3), prioritizing organic comfort and inviting tactile interactions:

- **Cards & Visual Containers:** Generously rounded corners with `rounded-2xl` (`1.25rem` / `20px`) to `rounded-3xl` (`1.75rem` / `28px`).
- **Interactive Controls & Buttons:** Full pills (`rounded-full` / `9999px`) for CTA buttons, quantity selectors, search fields, and category chips.
- **Icon Buttons & Floating Discs:** Perfect circles (`rounded-full`, aspect ratio 1:1) with balanced internal padding.
- **Book Artworks:** Kept at a restrained corner radius (`6px` to `8px`) to simulate authentic hardcover and paperback book corners against the soft surrounding pods.

## Components

### Buttons
- **Primary CTA ("Buy Now", "Confirm"):** Full pill shape (`rounded-full`), solid Deep Pine (`#1B4D3E`) fill, crisp white semibold typography, with generous vertical padding (`0.875rem 1.75rem`).
- **Secondary / Stepper ("QTY - 2 +"):** Soft tinted pill (`#F4F6F4`), slate text (`#1F2937`), with muted icon controls and inline spacing.
- **Icon Discs:** Round floating buttons (`44px × 44px`) in pure white (`#FFFFFF`) with elevation-1 shadow, housing neutral charcoal icons (`#1F2937`).

### Cards & Book Stages
- **Featured Book Stage:** Expansive rounded card featuring an ambient-tinted stage background (`#EBF3ED`), displaying the book jacket centered with a realistic drop shadow, followed by title, author attribution, and ochre rating stars below.
- **Horizontal Book Row Card:** Clean white container with an offset small thumbnail, vertical text stack (Title, Author, Rating), and an aligned right-side bookmark button.

### Search Field
- Full-pill capsule (`rounded-full`) with a soft background (`#FFFFFF` or `#F0F3F0`), subtle inset padding, muted placeholder text (`#9CA3AF`), and a delicate leading magnifying glass icon.

### Selection Chips & Navigation
- **Filter Tabs ("Bestseller", "Newest"):** Unselected tabs render in muted charcoal (`#6B7280`); active states use solid bold text (`#1F2937`) underlined with a gentle pill indicator or deep pine text emphasis.
- **Bottom Navigation Bar:** Floating dock with an ultra-light borderless white base, featuring vertical stacks of minimalist line icons and micro-labels. Active tabs highlight in vibrant pine (`#1B4D3E`).

### Badges & Ratings
- **Star Ratings:** 5-star cluster using Tertiary Honey Ochre (`#E6953B`) with empty stars in soft sand (`#E5E7EB`), complemented by numerical review counts in secondary slate.