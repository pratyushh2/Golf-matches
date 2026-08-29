# Signal Intelligence — targeted visual refinements

Four scoped refinements. No redesign: background, grid, particles, waveform, colors, spacing, wording, navbar and responsive structure stay as-is.

## 1. Top-left identity block (Hero)

The `SI / 01` / `SIGNAL` / `OBSERVATORY` column and the `Signal Intelligence` eyebrow get an editorial-instrumentation treatment instead of the current mono-heavy look:

- `SI / 01` stays small and technical but shifts to the sans grotesk at a small size with wider tracking and muted tone (a restrained mono numeral only for the `01`), so it reads like a plate number in a technical journal.
- `SIGNAL / OBSERVATORY` becomes small-caps-style sans with increased letter spacing, tighter line height, and lower contrast — an institutional imprint rather than a terminal readout.
- The `Signal Intelligence` eyebrow above the headline loses mono styling and becomes a quiet sans label with modest tracking.
- Hairline rule below the block is kept, slightly shortened for balance.
- Positioning, hierarchy and wording unchanged. No glow, gradient or neon.

## 2. Hero metadata tags

Replace the four outlined rectangles (`WAV`, `IQ`, `DSP`, `AI insights`) with fully rounded pills:

- `rounded-full`, thin `border-border`, translucent surface background, generous horizontal padding, smaller quiet type.
- Row stays horizontal, wraps on narrow screens.
- Hover: border brightens to `border-strong`, background changes subtly, ~300ms transition. Keep the small signal arrow only as a faint detail, or drop it so they don't read as buttons.
- No shadow, no glow, cursor stays default.

## 3. "How it works" — continuous timeline

Remove the eight bordered stage boxes. Rebuild the desktop strip as one continuous process line:

```text
01 Input ─── 02 Detect ─── 03 Preprocess ─── 04 DSP ─── ... ─── 08 Result
```

- Each stage is bare text: small stage number above/before a clean label, no container.
- A single thin hairline runs behind the whole row; short connector segments/arrow glyphs sit between stages at low opacity.
- Active stage: brighter label, stronger number in the signal tone, and a short underline/tick that slides beneath it.
- Inactive stages remain visible but subdued via opacity; passed stages sit slightly brighter than upcoming ones.
- Mobile keeps a vertical list of stages with the same bare, subdued/active treatment.

## 4. Active-stage motion and content transition

- The existing progress rail and travelling dot are merged into the timeline: the progressing line and marker now live on the timeline hairline instead of a separate bar below it.
- Marker and underline move with 300–600ms ease-out transitions, no bounce.
- The stage detail block below (number, title, copy) crossfades with a small vertical offset on stage change instead of swapping instantly, keyed off the active index.
- Scroll-driven progression logic and the rotating orbital arc stay unchanged.
- `prefers-reduced-motion` continues to fall back to instant, non-animated state changes.

## Technical notes

- Files touched: `src/components/si/Hero.tsx`, `src/components/si/Pipeline.tsx`, and small utility additions in `src/styles.css` if a shared pill/label utility helps (existing tokens only — no new colors).
- All styling uses existing semantic tokens (`--border`, `--border-strong`, `--surface`, `--signal`, `--muted-foreground`). No hardcoded colors.
- Existing scroll math in `Pipeline.tsx` (`p`, `active`) is reused; only the rendering layer changes.
- Verification: Playwright screenshots of hero and the pipeline section at desktop (1280) and mobile (390) widths, checking for overlap, wrapping and clipping, plus a clean build/console check.
