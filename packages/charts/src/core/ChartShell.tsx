import type { CSSProperties } from "react";
import { toCssVariables } from "@mav-charts/themes";
import type { ChartShellProps } from "./types";

export function ChartShell({
  code,
  title,
  subtitle,
  source,
  theme,
  children,
  description,
  state = "ready",
}: ChartShellProps) {
  const titleId = `chart-${code.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-title`;

  return (
    <article
      className="chart-card"
      data-chart-id={code}
      data-state={state}
      data-visual-system={theme.key}
      aria-labelledby={titleId}
      style={toCssVariables(theme) as CSSProperties}
    >
      <header className="chart-header">
        <div className="chart-code" aria-hidden="true">{code}</div>
        <div>
          <h2 id={titleId}>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>
      <div className="chart-stage">
        {state === "ready" ? children : (
          <div className="chart-state" role="status">
            {state === "empty" ? "No data available" : "The supplied data is invalid"}
          </div>
        )}
      </div>
      {description ? <p className="sr-only">{description}</p> : null}
      <footer>{source}</footer>
    </article>
  );
}
