# Decision 0001: Phase A foundation

Date: 2026-08-14  
Status: accepted

## Decision

MAV Charts V1 has exactly three visual systems: Signal, Editorial and Digital.
They share semantic chart geometry and differ through typed tokens. Customer
segments are catalog metadata and must not create additional themes.

The repository uses workspace package boundaries for `charts`, `themes`,
`motion`, `catalog` and deterministic `examples`. The current Vite page is the
temporary prototype/demo host; the Library website remains blocked until after
the chart library and GitHub release gates.

## Verification

- `npm run typecheck` validates strict TypeScript package contracts.
- `npm test` covers theme completeness, catalog uniqueness, deterministic
  fixtures, motion preferences, ChartShell states/accessibility and invariant
  geometry while switching visual systems.
- `npm run test:visual` freezes Signal, Editorial and Digital boards on desktop
  and mobile Chromium.
- `npm run build` produces the current demo bundle.

## Known follow-up

The demo still imports all nine prototype geometries from one source module, so
the production chunk exceeds 500 kB. Phase B will move each prototype to its
stable chart directory and expose tree-shakeable per-template exports.
