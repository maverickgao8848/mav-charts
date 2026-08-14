# Contributing to MAV Charts

Thank you for helping improve MAV Charts.

## Before opening a change

1. Search existing issues and pull requests.
2. For a new template or public API change, open a proposal first. V1 chart IDs and semantics are intentionally stable.
3. Keep data geometry honest: no invented zeroes, interpolated missing values, broken axes, or decorative encodings that change quantitative meaning.

## Local workflow

```bash
npm install
npm run check
npm run test:visual
```

When a visual baseline changes, explain why and inspect Signal, Editorial, and Digital at wide, mobile, and true 25% sizes. Do not update snapshots merely to silence a failure.

## Component contract

Every chart must retain its schema, deterministic example and edge fixtures, shared geometry, motion policy, bilingual README, metadata, unit/component/motion tests, SSR coverage, and visual spec. Keyboard interaction, mouse Tooltip, direct labels, an HTML legend, a screen-reader table, reduced motion, and zero console errors are required where applicable.

## Pull requests

- Keep changes focused and describe semantic or geometry tradeoffs.
- Add a Changeset for user-facing package changes: `npx changeset`.
- Confirm `npm run check` passes.
- Confirm affected Playwright specs pass without blindly regenerating unrelated snapshots.
- By contributing, you agree that your work is licensed under the repository's MIT License.
