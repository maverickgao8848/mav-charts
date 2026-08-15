---
name: mav-chart-maker
description: Recommend, configure, render, and deliver charts from the self-contained MAV Charts template runtime bundled with this skill. Use when a user asks to make a chart, visualize data, choose a MAV template, turn data into a report/PPT/image/web chart/video frame, or is unsure which chart to use. Work independently of the host repository, collect data from the selected template schema, require an explicit Signal/Editorial/Digital style choice, and never substitute generic or legacy chart templates.
---

# MAV Chart Maker

Use the MAV Charts runtime bundled inside this skill as the only chart-template source. Guide the user from a rough communication goal to a finished artifact rendered by a real MAV component, regardless of which repository hosts or invokes the skill.

## Non-negotiable rules

- Do not use `lieflat-charts`, generic chart templates, legacy chart templates, or a newly invented visual design as a substitute.
- Do not copy a MAV appearance into a different chart engine when the repository component can be rendered directly.
- Read the bundled live catalog and selected component files. Never rely on a duplicated static list of templates in the instructions.
- Recommend only catalog entries whose source component exists. Prefer `status: "stable"`; clearly disclose and obtain consent before using `prototype` or `planned` entries.
- Obtain an explicit visual-system choice: `Signal`, `Editorial`, or `Digital`. Never silently select one. If the user already named one, record it as the explicit choice.
- Never invent production data. Use placeholders only after the user authorizes a mockup and label them as placeholders.
- Ask only for missing information. Reuse data, audience, context, units, and output requirements already supplied.
- Preserve existing MAV component semantics, tokens, accessibility, and motion behavior.
- Treat the public MAV Charts website as the user's visual browsing companion. Provide useful website entry links throughout the conversation, not only in the final handoff.
- Keep the skill operational when the website is unavailable. Use the bundled runtime as the source of truth; use the website for discovery, previews, explanations, and user navigation.

## Resolve the bundled runtime

Set `SKILL_ROOT` to the directory containing this `SKILL.md`. Set `MAV_RUNTIME` to `SKILL_ROOT/assets/mav-charts`. Verify both of these markers exist inside `MAV_RUNTIME`:

- `packages/catalog/src/catalog.ts`
- `packages/charts/src/index.ts`

Do not search the host repository for MAV source and do not require the host to install MAV Charts. If either marker is missing, report that the skill installation is incomplete.

Read catalog, schemas, previews, and source directly from `MAV_RUNTIME`. Treat these bundled files as read-only. When rendering, building, or creating a user-specific page, materialize a writable copy:

```text
node "<SKILL_ROOT>/scripts/materialize-runtime.mjs" --output "<absolute-output-directory>"
```

Use the resulting directory as `MAV_WORKDIR`. Run `npm ci` inside `MAV_WORKDIR` when dependencies are absent. Never write user data or generated artifacts back into the installed skill directory.

Read [repository-map.md](references/repository-map.md) when locating files, previews, themes, viewports, or component APIs.
Read [website-entry-points.md](references/website-entry-points.md) before sharing website links or constructing template/style URLs.

## Workflow

Follow the stages in order. Combine questions where it reduces friction, but do not skip the style gate or delivery gate.

### 1. Frame the communication goal

Infer the intended message, audience, and use context from the request. If the request is too vague to distinguish templates, ask one focused question or offer the catalog's plain-language intent groups:

- compare or rank
- trend over time
- composition or part-to-whole
- distribution or uncertainty
- relationship between variables
- flow or hierarchy
- progress toward a target

Do not ask the user to name a chart type when they only know the business question.

When useful, give the user an immediate visual starting point: the website home page for orientation, the library for browsing, or a relevant audience collection. Do not require the user to browse before continuing the conversation.

### 2. Recommend from the live MAV catalog

Read `MAV_RUNTIME/packages/catalog/src/catalog.ts`. Match `questions`, `audiences`, `scenarios`, descriptions, and status to the user's goal. Resolve every catalog `githubPath` relative to `MAV_RUNTIME` and verify the component exists.

Recommend one primary template and at most two meaningful alternatives. For each, state:

- MAV ID and template name
- why it fits this request
- the main tradeoff versus the primary choice

Add a direct website link to every recommended template so the user can see the real chart before choosing. Link alternatives directly too; do not send the user back to the library to search by hand.

Show local catalog previews when they materially help the user choose. Use the actual preview files under `MAV_RUNTIME/public/catalog`; do not fabricate previews.

If one template is clearly dominant, recommend it and proceed to the style gate while allowing the user to object. If alternatives materially change the story, wait for the user's template choice.

### 3. Require the visual-system choice

Ask the user to choose exactly one visual system before rendering:

- **Signal**: black stage, strong editorial contrast, one decisive red signal.
- **Editorial**: hard-edged, precise analytical presentation with restrained blue/red accents.
- **Digital**: near-black monochrome research-instrument treatment with hairlines and quiet contrast.

Show the three real style previews for the selected template when available. You may recommend a style for the user's context, but still require the user to choose. Do not treat silence as consent.

Provide three direct website preview links for the selected template, one each for `signal`, `editorial`, and `digital`, so the user can compare the exact template in all three systems.

Use the exact prop value `signal`, `editorial`, or `digital` after the choice.

### 4. Inspect the selected template and collect data

Open the selected component directory under `MAV_RUNTIME` and read, at minimum:

- `README.md` for when to use it and its usage contract
- `schema.ts` for required fields and validation rules
- `example-data.ts` for shape examples only
- `index.tsx` for exported component name and props
- `metadata.ts` when present for additional semantics

Translate the schema into a compact user-facing request. Ask for only the required data and missing presentation fields such as unit, series names, date grain, target, source, title, or annotations when those props exist.

Alongside the data request, link to the selected template's website detail page and tell the user that its “什么时候用 / 准备这样的数据 / 让 Agent 开始制作” sections provide a visual explanation. Continue to ask for the data directly in chat; never make website reading a prerequisite.

Prefer accepting an attached spreadsheet/CSV/document or pasted table. If the user has no prepared data, provide a small fill-in table whose columns match the selected schema exactly.

Validate the supplied data with the selected template's validator when available. Report invalid, duplicate, missing, or non-finite values and ask for corrections instead of coercing them silently.

Read [intake-and-delivery.md](references/intake-and-delivery.md) for concise question patterns and data-handling rules.

### 5. Require the delivery choice

Ask what should be produced. Offer only relevant options, such as:

- PNG or SVG image
- one or more PowerPoint slides
- React/TypeScript chart component or page
- dashboard/web embed
- video frame or animated chart
- another explicitly requested format

Also resolve the viewport: `wide`, `standard`, `card`, or `mobile`. Recommend a viewport from the destination, but ask when the destination does not determine it.

For PowerPoint, render the real MAV component and place its SVG or high-resolution image into the deck. Do not recreate it as a native PowerPoint chart unless the user explicitly prioritizes native editability over exact MAV fidelity. When native editability is requested, explain the visual-fidelity tradeoff first.

For Excel, keep the source data editable in cells and include the rendered MAV chart; do not silently replace it with a generic Excel chart.

### 6. Build from the real component

Materialize `MAV_WORKDIR` before making task-specific changes. Use the selected component exported from `MAV_WORKDIR/packages/charts/src/<ID>-<slug>/index.tsx`. Supply:

- normalized, schema-valid user data
- the explicit `visualSystem` choice
- accurate title, subtitle, series labels, and units
- animation behavior appropriate to the output
- the requested or approved viewport and destination

Modify only the materialized working copy or the user's explicitly requested destination. Prefer a scoped example, page, or artifact over changing the reusable chart component. Do not overwrite the component's example data with user data.

Use another output-format skill when appropriate, such as presentations for `.pptx`, while retaining the MAV render as the chart source. Follow that skill's file-generation and verification requirements too.

### 7. Verify before delivery

Check all applicable items:

- The selected ID exists in the live catalog and maps to the component used.
- Data passes the template validator or its explicit schema rules.
- The rendered values, order, labels, units, and missing-value semantics match the source data.
- The explicit visual-system choice appears in the component props and rendered output.
- The selected viewport is legible without clipped labels or overlaps.
- No console error, build error, or newly introduced warning is present.
- Static captures disable or deterministically settle animation.
- PPT, image, web, or video output opens and visually matches the MAV template.
- Placeholder data, if authorized, is visibly identified as placeholder data.
- The installed skill remains unchanged; task-specific files live in the materialized copy or requested output directory.

Visually inspect the final artifact whenever rendering tools are available. Iterate on data mapping, title length, or viewport when the inspection reveals a problem; do not redesign the template.

## Handoff

Deliver the artifact and summarize:

- selected MAV template ID and name
- selected visual system
- output format and viewport
- data source used and any transformations
- artifact path or code files changed
- any remaining placeholder or limitation

Include the selected template's website link in the handoff. When it helps the next step, also include one relevant entry such as the full library, usage guide, or audience collection. Avoid dumping every site link when two focused links are enough.

Keep the handoff concise. Do not present unrelated generic chart alternatives after the MAV artifact is complete.
