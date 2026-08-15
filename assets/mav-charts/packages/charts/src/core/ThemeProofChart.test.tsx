import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProofChart } from "./ThemeProofChart";

const data = [
  { label: "Alpha", value: 24 },
  { label: "Beta", value: 41 },
  { label: "Gamma", value: 33 },
];

describe("ThemeProofChart", () => {
  it("switches all approved systems without changing geometry", () => {
    const { container, rerender } = render(<ThemeProofChart data={data} visualSystem="signal" />);
    const signature = container.firstElementChild?.getAttribute("data-geometry-signature");
    expect(screen.getByRole("article")).toHaveAttribute("data-visual-system", "signal");

    rerender(<ThemeProofChart data={data} visualSystem="editorial" />);
    expect(container.firstElementChild).toHaveAttribute("data-geometry-signature", signature);
    expect(screen.getByRole("article")).toHaveAttribute("data-visual-system", "editorial");

    rerender(<ThemeProofChart data={data} visualSystem="digital" />);
    expect(container.firstElementChild).toHaveAttribute("data-geometry-signature", signature);
    expect(screen.getByRole("article")).toHaveAttribute("data-visual-system", "digital");
  });
});
