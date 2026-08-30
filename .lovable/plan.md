# Technical Reproduction Spec (documentation only — no UI changes)

Produce one complete, code-exact specification document of the current landing page, written for another coding agent to reproduce it in a plain local React environment. No source files are modified.

## Deliverable

A single markdown document, `Signal-Intelligence-Implementation-Spec.md`, saved to the documents area and attached in chat. Estimated 2,500–4,000 lines including verbatim code, since exact reproduction requires the real source of the canvas components.

## Document sections (mapping the 21 requested areas)

1. **Stack** — exact pinned versions from package.json: React 19.2, TypeScript 5.8, Tailwind 4.2, Vite 8.1.5, TanStack Router 1.170.18 / Start 1.168.32, lucide-react 0.575, bun as package manager. Explicit note: the page uses **zero** animation or canvas libraries — all motion is hand-written `requestAnimationFrame` + Canvas 2D + CSS transitions. Also lists which shipped deps (Radix, recharts, react-hook-form, sonner, zod) the landing page does **not** use, so the reproduction stays minimal.
2. **File tree** — the 12 files that actually render the page (`src/routes/__root.tsx`, `src/routes/index.tsx`, `src/styles.css`, `src/lib/theme.tsx`, `src/lib/utils.ts`, and the seven `src/components/si/*` files) with purpose, exports, imports, and consumers for each.
3. **Render hierarchy** — actual tree: RootShell (`<html class="dark">`) → QueryClientProvider → Outlet → Index → ThemeProvider → ParticleField (fixed, `-z-10`, containing GridLayer + canvas + radial mask) → Header (fixed) → main (Hero → Pipeline → Capabilities → ResultPreview → inline `#analyze` CTA) → Footer.
4. **Hero** — `min-h-[100svh]`, `pt-16`, 12-column grid (2-col identity block hidden below `md`, 10-col content), absolutely positioned SignalTrace at `top-1/2` with `h-[44vh] opacity-60`, exact type scale (`2.6rem → 6xl → 4.5rem`, tracking `-0.03em`, leading `1.04`), the four pills, and both MagneticLink CTAs.
5. **ParticleField** — Canvas 2D. Verbatim documentation of: density divisor (13000 desktop / 26000 mobile), count cap (150 / 45), base-point drift `sin(t + bx*0.01)*6`, cursor radius 150 with `k = 1 - d/R` and push `k²*26`, easing constants 0.06 / 0.12, connection threshold 108px with `alpha = (1 - d/108) * (0.05 + near*0.22)`, radius `1 + k*0.9`, the `mix()` RGB lerp, DPR clamp at 2, mobile pointer-listener skip, reduced-motion single static frame, and cleanup.
6. **SignalTrace** — the five waveform generators (smooth oscillation, modulated, stepped/quantized, noisy 3-harmonic, dual-Gaussian spectral envelope) with their exact formulas, the 7-second `MORPH` stage timer, `phase = (t/7) % 5`, smoothstep blend `k = k²(3-2k)`, three stacked passes (amplitudes `0.3h / 0.18h / 0.1h`, offsets, widths 1.4 / 1 / 0.8), and the frozen `t = 3` reduced-motion frame.
7. **Grid** — inline `linear-gradient` layer, 72×72px, `rgba(230,227,223,0.045)` dark / `rgba(40,36,32,0.055)` light, static (no parallax).
8. **Pipeline scroll engine** — `h-[420svh]` section with a `sticky top-0 h-[100svh]` inner shell; `target = clamp(-rect.top / (rect.height - innerHeight))` on a passive scroll listener, decoupled rAF smoothing `current += (target - current) * 0.12`, `active = floor(p * 8)`, `p`-driven progress bar width, marker `left: calc(p*100% - 3px)`, orbital `rotate(p*180 - 90deg)`, and per-stage opacity/color/underline rules. Includes pseudocode plus why upward scroll works symmetrically.
9. **Pipeline DOM/CSS** — element-by-element table of sticky / absolute / relative / flex / overflow-hidden usage, and the `key={active}` remount that drives the copy crossfade.
10. **Theme system** — `ThemeProvider` in `src/lib/theme.tsx`, `si-theme` localStorage key, `.dark` class toggled on `documentElement`, note that no `prefers-color-scheme` detection exists (dark is the hardcoded default), the 600ms body color transition, and the `palette()` canvas RGB tables. Full oklch token table for both themes.
11. **Typography** — Google Fonts `<link>` in the root `head()`, Instrument Sans + JetBrains Mono, `@theme` font vars, and the per-element size/tracking/leading values.
12. **Capabilities** — 1px hairline grid via `gap-px bg-border`, two columns from `sm`, the numbered mono meta line, `rule-line`, `max-w-[22ch]` copy, and the inline SVG waveform that goes 0.5 → 1 opacity on group hover.
13. **Result preview** — the shared `useCanvas` hook, the Spectrum bar formula (46 bars, dual Gaussian peaks), the Spectrogram cell formula (60×14 grid), the reused SignalTrace waveform, and the ILLUSTRATIVE label plus em-dash placeholder rows.
14. **Navbar** — fixed, `h-16`, `bg-background/70 backdrop-blur-md`, hash links, lucide Sun/Moon toggle, bordered Analyze CTA; documents that there is no mobile menu (nav links hidden below `md`).
15. **Interactions** — `MagneticLink` translate3d math (`0.06` x-factor, `0.12` y-factor, reset on leave), the `hover-arrow` CSS utility, pill hover, and a table of which technique each animation uses (CSS transition vs rAF vs React state vs scroll listener). Notes that no IntersectionObserver or scroll library is used.
16. **Responsive** — Tailwind v4 default breakpoints (`sm 40rem`, `md 48rem`, `lg 64rem`) and exactly what appears/disappears at each, plus the `<768px` particle branch.
17. **Performance** — single rAF per canvas, listener cleanup, passive scroll, DPR clamp, decoupled scroll read from render, mobile particle reduction, reduced-motion paths.
18. **CSS map** — everything lives in `src/styles.css`: `@theme inline` token bridge, `:root` / `.dark` blocks, base layer, and the three custom utilities `label-mono`, `rule-line`, `hover-arrow`, plus the global reduced-motion override.
19. **Verbatim source appendix** — full current contents of all seven `si/*` components, `src/lib/theme.tsx`, `src/routes/index.tsx`, and `src/styles.css`, so nothing needs to be guessed.
20. **Reproduction checklist** — Phases 1–11 as requested, including the porting note that a plain Vite + React SPA needs a router substitution and a `<head>` equivalent for the font link and page metadata.
21. **Deviation notes** — places where the current build differs from the original brief (e.g. no orbital "traveling particle" separate from the timeline marker; no system-preference theme detection; History nav link points at the preview section), documented as-is rather than corrected.

## Technical notes

The document is descriptive only. No component, style, or config file is touched.
