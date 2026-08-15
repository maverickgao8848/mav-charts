# MAV Charts repository map

Use this map to discover the self-contained implementation bundled with the skill. Resolve all paths relative to `MAV_RUNTIME = <skill-directory>/assets/mav-charts`. Treat bundled source as authoritative if any path changes.

## Root markers

- Catalog: `MAV_RUNTIME/packages/catalog/src/catalog.ts`
- Chart barrel: `MAV_RUNTIME/packages/charts/src/index.ts`
- Theme package: `MAV_RUNTIME/packages/themes/src/index.ts`
- Shared chart types: `MAV_RUNTIME/packages/charts/src/core/types.ts`

## Catalog contract

Each catalog entry exposes an ID, slug, English and Chinese names/descriptions, communication questions, audiences, scenarios, visual systems, engine primitives, component path, and status. Use these fields for matching rather than maintaining a separate template list.

Relevant controlled values currently include:

- questions: `compare`, `trend`, `composition`, `distribution`, `relationship`, `flow`, `progress`
- audiences: `consulting`, `finance`, `product`, `marketing`, `operations`
- scenarios: `report`, `dashboard`, `web`, `video`
- status: `planned`, `prototype`, `stable`

## Component contract

Resolve a catalog item to `MAV_RUNTIME/packages/charts/src/<ID>-<slug>/`. Inspect:

- `index.tsx`: component and prop exports
- `schema.ts`: datum types, geometry helpers, and validators
- `example-data.ts`: valid shapes and edge cases, never user data storage
- `metadata.ts`: chart identity and semantics
- `motion.ts`: visual-system-aware animation
- `README.md`: suitability, misuse warnings, and sample import
- `__tests__/`: expected validation and rendering behavior

Do not assume that all components accept identical props. Read the chosen `index.tsx` every time.

## Visual systems

Read `MAV_RUNTIME/packages/themes/src/index.ts` for current tokens and exact IDs:

- `signal`
- `editorial`
- `digital`

Never approximate these systems with hand-authored colors when the actual tokens can be consumed.

## Viewports and previews

Shared viewport IDs live in `MAV_RUNTIME/packages/charts/src/core/types.ts`:

- `wide`
- `standard`
- `card`
- `mobile`

Catalog preview naming convention:

- default: `MAV_RUNTIME/public/catalog/<ID>.png`
- style previews: `MAV_RUNTIME/public/catalog/<ID>-signal.png`, `<ID>-editorial.png`, `<ID>-digital.png`

Confirm a file exists before showing or using it.

## Verification entry points

Read `MAV_RUNTIME/package.json` for current commands. Prefer the narrowest relevant checks first, then run broader checks in proportion to the requested change. Existing commands include type checking, unit tests, builds, and Playwright visual tests.

## Portability utilities

- `scripts/materialize-runtime.mjs`: copy the bundled runtime to a new writable directory without relying on the host repository.
- `scripts/check-portability.mjs`: verify bundled catalog paths, components, visual previews, and absence of machine-specific paths.

Resolve these utilities relative to the skill directory, not the host working directory.
