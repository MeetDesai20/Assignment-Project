# Design System Specification: The Ethereal Ledger

## 1. Overview & Creative North Star
### The Creative North Star: "The Ethereal Ledger"
This design system is built to bridge the gap between the cold precision of high-stakes fintech and the vibrant, emotional resonance of gaming and philanthropy. We are moving away from the "SaaS template" look. Instead, we embrace a **High-End Editorial** aesthetic.

The experience should feel like a premium digital concierge. We break the rigid grid through **intentional asymmetry**, allowing elements to overlap and breathe. We utilize deep tonal layering to create a sense of infinite space, where data doesn't just sit on a screen—it floats within an environment. We are building a "Ledger" that feels alive, premium, and trustworthy.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in a deep, cosmic void (`#0c0e14`), punctuated by high-vibrancy "Neon" accents that signify action and reward.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
*   **How to define boundaries:** Use shifts in the `surface-container` tiers. 
*   **The Technique:** A `surface-container-low` section sitting on a `surface` background creates a natural, sophisticated break. If you need more definition, use a soft gradient transition rather than a hard stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials.
*   **Base:** `surface-dim` (#0c0e14)
*   **Layer 1:** `surface-container-low` (#11131a) - Main content areas.
*   **Layer 2:** `surface-container` (#161922) - Secondary modules/cards.
*   **Layer 3:** `surface-container-high` (#1c1f29) - Overlays and active states.

### The "Glass & Gradient" Rule
To achieve the premium Web3/Fintech hybrid look:
*   **Glassmorphism:** Use `surface-variant` at 40-60% opacity with a `backdrop-blur` of 20px–40px for floating navigation or high-level modals.
*   **Signature Textures:** Main CTAs should never be flat. Apply a linear gradient from `primary` (#81ecff) to `primary-container` (#00e3fd) at a 135-degree angle to provide a "lit from within" glow.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Expression) with **Inter** (Function).

*   **Display & Headlines (Manrope):** These are your "hooks." Use `display-lg` with tight letter-spacing (-0.02em) for hero moments. This conveys modern authority.
*   **Body & Labels (Inter):** For performance tracking and data, Inter provides the "Trustworthy" fintech feel. Its neutral architecture ensures that complex subscription data remains legible.
*   **Hierarchy as Storytelling:** Use extreme contrast. Pair a `display-sm` headline with a `label-md` uppercase caption to create a "Magazine" feel.

---

## 4. Elevation & Depth
We eschew traditional "Drop Shadows" for **Ambient Glows** and **Tonal Layering.**

### The Layering Principle
Depth is achieved by "stacking." Place a `surface-container-highest` card on top of a `surface-container-low` section. The delta in hex value provides the elevation.

### Ambient Shadows
When a component must "float" (e.g., a reward draw notification):
*   **Blur:** 40px to 80px.
*   **Opacity:** 4%–8%.
*   **Color:** Use a tinted version of `on-surface` or `primary` to mimic light refraction, never pure black.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use the **Ghost Border**:
*   **Token:** `outline-variant` (#444854).
*   **Opacity:** 10% to 20% max. It should be felt, not seen.

---

## 5. Components

### Buttons: The Kinetic Pill
*   **Primary:** Pill-shaped (`rounded-full`), using the Primary-to-Primary-Container gradient. No border. Box-shadow should be a soft `primary-dim` glow.
*   **Secondary:** Glassmorphic. Semi-transparent `surface-variant` with a 10% `outline` Ghost Border.
*   **States:** On hover, increase the `backdrop-blur` and slightly shift the gradient hue toward `secondary`.

### Cards: The Content Vessel
*   **Constraint:** **Strictly no dividers.** Use 24px–32px of vertical padding to separate content.
*   **Background:** `surface-container-low`.
*   **Interactive State:** On hover, transition the background to `surface-container` and apply a subtle `tertiary` (emerald) top-edge glow (1px height gradient).

### Input Fields: Minimalist Precision
*   **Style:** Underline or "Floating Glass." Avoid the "boxed-in" feel.
*   **Focus:** The label should transition to `primary` and the "Ghost Border" should animate to a 100% opaque `primary` stroke.

### Selection Chips
*   Use `secondary-container` for unselected and `secondary` for selected. 
*   Add a subtle neon-purple `on-secondary-container` inner glow to selected chips to give them a "gaming" energy.

### Progress & Performance Trackers
*   Use `tertiary` (Emerald) for positive growth and charity impact.
*   Use `primary` (Neon Blue) for system performance.
*   Trackers should use rounded-full caps and a 20% opacity background track of the same color.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a structural element. If in doubt, add 16px more padding.
*   **DO** overlap elements (e.g., a glass chip overlapping the edge of a card) to create a custom, non-template feel.
*   **DO** use `tertiary` accents specifically for "Charity" or "Success" actions to build an emotional connection with growth.

### Don't
*   **DON'T** use 100% opaque borders or dividers. They kill the "Ethereal" vibe.
*   **DON'T** use sports imagery or clichés. Keep the visuals focused on data, abstract glass shapes, and high-end photography.
*   **DON'T** use standard "Grey" for shadows. Always tint shadows with a hint of the brand's blue or purple to maintain the dark-mode richness.
*   **DON'T** crowd the UI. If the performance tracking is complex, use progressive disclosure (nested surfaces).

---

## 7. Spacing & Grid
*   **The Breathing Grid:** Use a standard 8pt grid, but break it for "Hero" elements. 
*   **Alignment:** Use a mix of center-aligned typography for "Exciting" moments (Draws, Rewards) and left-aligned typography for "Trustworthy" moments (Fintech data, Performance).