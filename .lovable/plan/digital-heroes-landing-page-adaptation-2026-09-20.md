# Digital Heroes landing-page adaptation

## Goal
Transform the existing Filing Intelligence landing page into the Digital Heroes golf and charity subscription experience without rebuilding the app, adding backend behavior, or inventing operational data.

## What will change
- Keep the current charcoal theme, typography, spacing, grid atmosphere, restrained accent, header/footer structure, section widths, and responsive breakpoints.
- Rewrite the landing-page navigation, hero, feature section, process timeline, membership section, footer, and page metadata for Digital Heroes.
- Replace the filing document visual with one cohesive, subtle golf-ball trajectory and flag visual using local SVG/CSS and the existing design tokens.
- Replace the six folder previews with a reusable `FeatureBookCard`:
  - front cover shows feature title and `Included` or `Premium` access badge;
  - hover opens the cover with a restrained 3D rotation over 500ms;
  - keyboard focus and touch/click toggle the same state;
  - reduced-motion mode uses an immediate/fade reveal;
  - the existing `Explore` action remains and points to relevant landing-page sections.
- Use six real product concepts: Score Tracking, Subscription & Membership, Prize Draws, Charity Contributions, Winner Verification, and User Dashboard.
- Repurpose the existing scroll timeline into the user journey: join, choose membership, maintain scores, enter draws, verify outcomes, support charity.
- Replace the current filing-analysis demo area with a subscription-ready membership comparison using descriptive access rules only—no prices, status, checkout simulation, transactions, or success states.
- Add clear frontend-only domain types for `User`, `Subscription`, `Score`, `Charity`, `Draw`, and `Winner`, with no records or mock service implementation.

## Files and scope
- Update existing landing files: `src/routes/index.tsx`, `src/components/si/Hero.tsx`, `Capabilities.tsx`, `Pipeline.tsx`, `PipelineVisual.tsx`, and `Chrome.tsx`.
- Add focused reusable files for the golf visual, feature-book interaction, membership presentation, and domain types.
- Update only the semantic theme tokens or shared motion utilities required by the book/golf presentation; preserve the existing palette and typography system.
- Update app-specific metadata in the root and landing route.
- Keep TanStack routing, theme behavior, background particle/grid treatment, and unrelated routes/components intact. No packages, backend, authentication, payment, or Supabase setup will be added.

## Validation
- Confirm no new fake users, statistics, prices, transactions, winners, draws, analytics, or subscription statuses exist.
- Check the landing page at desktop and mobile widths for overflow, readable text, stable navigation, book hover/tap behavior, and reduced-motion behavior.
- Verify the current preview builds without errors and that all landing-page anchors and Explore links work.
