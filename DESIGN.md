---
name: Brigida Finance
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#2b6954'
  on-secondary: '#ffffff'
  secondary-container: '#adedd3'
  on-secondary-container: '#306d58'
  tertiary: '#55615f'
  on-tertiary: '#ffffff'
  tertiary-container: '#98a5a3'
  on-tertiary-container: '#2f3b39'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  negative: '#f43f5e'
  on-negative: '#ffffff'
  negative-container: '#ffe4e8'
  on-negative-container: '#8a0f2c'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#b0f0d6'
  secondary-fixed-dim: '#95d3ba'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#0b513d'
  tertiary-fixed: '#d8e5e2'
  tertiary-fixed-dim: '#bcc9c6'
  on-tertiary-fixed: '#121e1c'
  on-tertiary-fixed-variant: '#3d4947'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  hero-display:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 1.05
    letterSpacing: -0.02em
  hero-display-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 1.08
    letterSpacing: -0.02em
  display-idr:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 20px
  gutter-mobile: 12px
---

## Brand & Style

The brand personality is rooted in "Financial Vitality"—a concept that blends the stability of a bank with the energy of a lifestyle app. The target audience is Indonesian young professionals and families seeking a tool that feels fresh, intuitive, and trustworthy rather than clinical or overwhelming.

The design style is **Modern Minimalism**. It prioritizes heavy whitespace to reduce cognitive load when viewing complex transaction data, paired with high-quality typography and a vibrant accent color. Subtle glassmorphism is utilized for navigation elements to provide a sense of layering and modernity without distracting from the core financial data. The UI evokes an emotional response of clarity and optimism regarding one's financial future.

## Colors

The palette is anchored by a vibrant "Emerald Mint" primary color, symbolizing growth and fresh starts. This is balanced by a deep "Forest Green" secondary color used for high-contrast text and interactive states to ensure professionalism.

- **Primary:** Use for main actions, active navigation states, and success indicators.
- **Secondary:** Reserved for headers, deep-contrast elements, and brand accents.
- **Tertiary:** A soft background tint for card backgrounds and subtle sections.
- **Neutral:** A range of slate grays to manage hierarchy in transaction lists and metadata.
- **Semantic:** Positive values (income) use the Primary green; negative values (expenses) use the **Negative** token (`#f43f5e`, a refined coral red) — never the `error` token, which is reserved for form validation and system errors, not transaction amounts.

## Typography

This design system utilizes **Inter** for its exceptional legibility and neutral, systematic feel. Given the Indonesian context where currency strings (IDR) can become quite long, the typeface's compact nature prevents layout breaking.

- **Marketing Hero:** Use `hero-display` (`hero-display-mobile` under 768px) for landing-page and campaign headlines only — the single largest, boldest statement on a page. Never use it inside the product UI; `display-idr` remains the ceiling for in-app type.
- **Currency Display:** Use `display-idr` for main account balances. Always include the "Rp" prefix with slightly reduced weight or opacity to emphasize the numerical value.
- **Transaction Headers:** Use `headline-md` for merchant names.
- **Metadata:** Use `body-sm` for dates, categories, and payment methods (e.g., QRIS, E-Wallet).
- **Labels:** Use `label-md` in all-caps for over-line section titles like "LATEST TRANSACTIONS."

## Layout & Spacing

The layout follows a **fluid grid** model optimized for mobile devices. It utilizes a base 4px unit to ensure all spacing is mathematically consistent.

- **Safe Zones:** A mandatory 20px horizontal margin is maintained on all mobile screens to prevent content from hitting the edge of modern curved displays.
- **Vertical Rhythm:** Use 16px (`md`) spacing between related items in a list and 24px (`lg`) between distinct content sections.
- **Touch Targets:** All interactive elements must maintain a minimum height of 48px to ensure ease of use during one-handed mobile operation.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. This design system avoids harsh borders in favor of soft shadows that suggest physical stacking.

- **Level 0 (Surface):** The main app background, using a very light gray or tertiary tint.
- **Level 1 (Cards):** Main content containers. They use a white background with a 10% opacity primary-tinted shadow (Blur: 20px, Y: 4px).
- **Level 2 (Modals/Floating Actions):** Elevated elements like "Add Transaction" buttons. These use a more pronounced shadow (Blur: 30px, Y: 8px) and a subtle 1px border in a slightly darker neutral to define the edge.
- **Backdrop:** When modals are active, use a 40% opacity blur (10px) on the background layer to focus the user's attention.

## Shapes

The shape language is "Friendly & Modern." We use a generous roundedness to make the financial data feel less intimidating.

- **Standard Containers:** Cards and input fields use a 16px radius (`rounded-lg` in this system).
- **Small Elements:** Buttons and tags use a 12px radius (`rounded-md`).
- **Pills:** Status chips and floating info badges use full rounding (`rounded-full`) to read as lightweight, secondary to the 12–16px containers around them.
- **Icons:** Icons should be contained within squircle-shaped backgrounds with a 12px radius to maintain consistency with the UI elements.

## Components

### Buttons
- **Primary:** Full-width emerald green background with white text. High-contrast, 16px height padding, 12px radius.
- **Ghost:** Primary color text with no background, used for secondary actions like "View All History."

### Cards
- **Balance Card:** A gradient-fill container (Primary to Secondary) with glassmorphism overlays for the "Card Number" or "Account Type."
- **Transaction Item:** A horizontal layout with a leading icon (rounded bg), merchant title, and trailing amount (colored by type: `primary` for positive, `negative` for expenses).

### Input Fields
- **Currency Input:** Specialized field with a fixed "Rp" prefix. Uses a larger font size than standard text inputs.
- **Dropdowns:** Styled for local contexts, including specific categories like "Pulsa/Data," "Listrik," and "Zakat/Donasi."

### Chips
- Used for transaction status (e.g., "Selesai," "Diproses," "Gagal"). These use low-opacity versions of semantic colors with high-contrast text, `rounded-full`.

### Subtle Dividers
- Use 1px hair-lines with #E2E8F0 color. Dividers should never touch the edge of the screen; they should respect the 20px margin.
