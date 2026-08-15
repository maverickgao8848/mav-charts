# Intake and delivery patterns

Use these patterns to keep the conversation short while collecting exact requirements.

## Template recommendation

Use this structure:

> 首选 **<ID> <name>**，因为它最直接回答“<user question>”。
>
> 备选 **<ID> <name>**：当你更想强调 <tradeoff> 时使用。

Offer no more than two alternatives. Do not make the user browse the whole catalog unless they ask.

## Mandatory style gate

Use a direct choice after identifying the template:

> 请选择 MAV 风格：
>
> **Signal**：黑底、高对比、一个强红色信号。
>
> **Editorial**：硬朗、精确、分析报告感。
>
> **Digital**：近黑单色、细线、研究仪器感。
>
> 我更推荐 <style>，因为 <contextual reason>；最终由你选择。

If local previews exist, show all three previews with clear labels. Do not generate before the user makes the selection.

## Schema-derived data request

Convert the actual datum type into a pasteable table. For example, a schema containing `label`, `value`, and optional `detail` becomes:

| label | value | detail（可选） |
|---|---:|---|
|  |  |  |

Then ask only for component props not already established:

- title and subtitle
- units and series names
- source or footnote
- target, threshold, comparison series, event, or hierarchy fields required by that component

Do not request optional fields that do not improve the stated communication goal.

## Files and messy data

- Accept CSV, XLSX, pasted tables, JSON, or data embedded in documents.
- Preserve the original file. Normalize data into a new scoped artifact or in-memory structure.
- State material transformations such as sorting, aggregation, percentage normalization, binning, indexing, or missing-value handling.
- Ask before applying a transformation that changes the user's analytical meaning.
- Keep `null` distinct from zero whenever the selected schema does.

## Mandatory delivery gate

Use a compact question:

> 最终要交付成什么：PNG/SVG、PPT、React/网页、仪表盘组件，还是视频画面？使用场景如果已经确定，我会推荐对应的 `wide`、`standard`、`card` 或 `mobile` 规格。

## Delivery contracts

### Image

- Prefer SVG when vector fidelity and downstream editing matter.
- Prefer high-resolution PNG when compatibility matters.
- Settle or disable animation before capture.

### PowerPoint

- Render the actual MAV component.
- Place SVG when supported; otherwise use a verified high-resolution PNG.
- Preserve source data separately when the user needs later updates.
- Do not imitate the template with a native Office chart by default.

### React or web

- Import the selected chart component from its real package path.
- Keep user-specific data outside the reusable component source.
- Pass the exact visual-system ID and validate responsive behavior.

### Dashboard

- Prefer `standard` or `card` unless the dashboard layout indicates otherwise.
- Preserve keyboard access, tooltip behavior, and accessible data representation.

### Video

- Prefer `wide` unless the requested platform dictates another aspect ratio.
- Use the component's motion implementation and reduced-motion contract.
- Verify deterministic timing for capture or rendering.

## Minimal handoff

Report `template / style / viewport / format / data source / artifact`. Mention transformations and placeholders, if any.
