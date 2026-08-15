# MAV Charts website entry points

Use these canonical public URLs. Keep the bundled runtime as the implementation source of truth.

## Main entries

- Home and three visual systems: `https://maverickgao8848.github.io/mav-charts/`
- Full chart library: `https://maverickgao8848.github.io/mav-charts/library`
- Usage guide: `https://maverickgao8848.github.io/mav-charts/guides`
- About: `https://maverickgao8848.github.io/mav-charts/about`

## Audience collections

- Consulting: `https://maverickgao8848.github.io/mav-charts/collections/consulting`
- Finance: `https://maverickgao8848.github.io/mav-charts/collections/finance`
- Product: `https://maverickgao8848.github.io/mav-charts/collections/product`
- Marketing: `https://maverickgao8848.github.io/mav-charts/collections/marketing`
- Operations: `https://maverickgao8848.github.io/mav-charts/collections/operations`

## Template and style deep links

Construct a template URL from the catalog ID and the confirmed or previewed visual system:

```text
https://maverickgao8848.github.io/mav-charts/charts/<ID>?system=<visual-system>
```

Use uppercase catalog IDs such as `B04`. Use exactly `signal`, `editorial`, or `digital` for `<visual-system>`.

Example links for B04:

- Signal: `https://maverickgao8848.github.io/mav-charts/charts/B04?system=signal`
- Editorial: `https://maverickgao8848.github.io/mav-charts/charts/B04?system=editorial`
- Digital: `https://maverickgao8848.github.io/mav-charts/charts/B04?system=digital`

The detail page contains the rendered chart plus the “什么时候用”, “准备这样的数据”, and “让 Agent 开始制作” sections. Link the template detail page when recommending, comparing styles, collecting data, and handing off.

## Conversation behavior

- Share links as descriptive Markdown links, not bare URLs.
- Deep-link to the exact template and style whenever those are known.
- When the user wants to browse or compare visually and browser tools are available, open the relevant live page and inspect it with the user.
- Give links at decision points, but keep the conversation moving without requiring a website visit.
- If the public website cannot be reached, continue with the bundled catalog, local previews, schemas, and components.
