import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./button";
import { DataTable } from "./data-table";
import { Field, Input } from "./field";

afterEach(cleanup);

describe("Field", () => {
  it("labels the control and links the error for screen readers", () => {
    render(<Field label="Email" error="Enter a valid email address.">{(p) => <Input {...p} />}</Field>);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe("Enter a valid email address.");
  });

  it("shows help text when there is no error", () => {
    render(<Field label="GSTIN" help="15 characters" optional>{(p) => <Input {...p} />}</Field>);
    const input = screen.getByLabelText(/GSTIN/);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(document.getElementById(input.getAttribute("aria-describedby")!)?.textContent).toBe("15 characters");
  });
});

describe("Button", () => {
  it("is disabled and busy while loading", () => {
    render(<Button loading>Save</Button>);
    const b = screen.getByRole("button", { name: "Save" });
    expect(b).toHaveProperty("disabled", true);
    expect(b.getAttribute("aria-busy")).toBe("true");
  });
});

describe("DataTable", () => {
  it("renders the empty state when there are no rows", () => {
    render(<DataTable columns={[{ key: "n", header: "Name", cell: (r: { n: string }) => r.n }]} rows={[]} rowKey={(r) => r.n} empty={<p>Nothing yet</p>} />);
    expect(screen.getByText("Nothing yet")).toBeTruthy();
  });
  it("renders rows", () => {
    render(<DataTable columns={[{ key: "n", header: "Name", cell: (r: { n: string }) => r.n }]} rows={[{ n: "Asha" }]} rowKey={(r) => r.n} caption="People" />);
    expect(screen.getByRole("table", { name: "People" })).toBeTruthy();
    expect(screen.getByText("Asha")).toBeTruthy();
  });
});
