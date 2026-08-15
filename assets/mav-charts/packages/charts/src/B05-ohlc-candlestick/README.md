# B05 OHLC Candlestick / OHLC 蜡烛图

Use this chart for ordered trading sessions with one same-unit open, high, low and close price per candle. Wick length shows the full low-high range; the body shows open-close direction and magnitude. / 用于有序交易时段，每根蜡烛包含同单位开、高、低、收价格；影线表示最低到最高的完整区间，实体表示开收到方向与幅度。

Every complete candle must satisfy `low <= open/close <= high`. All four values must be finite. A missing session must set all four fields to `null`; partial candles are invalid and never inferred. Negative prices are accepted when the source instrument legitimately supports them. / 完整蜡烛必须满足 `low <= open/close <= high` 且四值有限。缺失时四字段必须全部为 `null`；部分缺失无效且不会推断。若标的确实允许负价，则负值合法。

The shared price domain uses complete candle lows/highs with honest padding and never forces zero. Up, down and flat candles are distinct. Do not use this template for unordered categories, mixed currencies, volume, or adjusted/unadjusted prices on one scale. / 共享价格域由完整蜡烛的低/高值与诚实 padding 构成，绝不强制零点；涨、跌、平盘明确区分。不得用于无序类别、混合币种、成交量或混合复权口径。

```ts
type OhlcDatum = { label: string; open: number|null; high: number|null; low: number|null; close: number|null; detail?: string };
```

```tsx
<OhlcCandlestickChart data={ohlcExample} unit=" USD" />
```

Tooltip, keyboard status and table expose all four exact prices. Long session labels are visually shortened while their full names remain accessible. / Tooltip、键盘状态和表格提供全部四个精确价格；长交易时段标签可视觉截断，但全文可访问。

