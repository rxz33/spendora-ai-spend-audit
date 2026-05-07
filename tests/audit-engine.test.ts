import { describe, expect, it } from "vitest";
import { runAudit } from "@/lib/audit-engine";

describe("audit engine", () => {
  it("recommends GitHub Copilot for Cursor users", () => {
    const results = runAudit([
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 20,
        seats: 1,
        useCase: "Coding",
      },
    ]);

    expect(results[0].recommendation).toContain(
      "GitHub Copilot"
    );
  });

  it("calculates monthly savings correctly", () => {
    const results = runAudit([
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 20,
        seats: 1,
        useCase: "Coding",
      },
    ]);

    expect(results[0].monthlySavings).toBe(10);
  });

  it("calculates annual savings correctly", () => {
    const results = runAudit([
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 20,
        seats: 1,
        useCase: "Coding",
      },
    ]);

    expect(results[0].annualSavings).toBe(120);
  });

  it("detects inefficient team plans", () => {
    const results = runAudit([
      {
        tool: "Claude",
        plan: "Team",
        monthlySpend: 30,
        seats: 1,
        useCase: "AI Chat",
      },
    ]);

    expect(results[0].recommendation).toContain(
      "Downgrade"
    );
  });

  it("returns optimal recommendation when no issues found", () => {
    const results = runAudit([
      {
        tool: "Perplexity",
        plan: "Pro",
        monthlySpend: 17,
        seats: 5,
        useCase: "Research",
      },
    ]);

    expect(results[0].recommendation).toContain(
      "optimal"
    );
  });
});