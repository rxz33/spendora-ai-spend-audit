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
        teamSize: 1,
        useCase: "coding",
      },
    ]);

    expect(
      results[0].recommendation
    ).toContain("GitHub Copilot");
  });

  it("calculates monthly savings correctly", () => {
    const results = runAudit([
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 20,
        seats: 1,
        teamSize: 1,
        useCase: "coding",
      },
    ]);

    expect(
      results[0].monthlySavings
    ).toBe(10);
  });

  it("calculates annual savings correctly", () => {
    const results = runAudit([
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 20,
        seats: 1,
        teamSize: 1,
        useCase: "coding",
      },
    ]);

    expect(
      results[0].annualSavings
    ).toBe(120);
  });

  it("detects inefficient small-team plans", () => {
    const results = runAudit([
      {
        tool: "Claude",
        plan: "Team",
        monthlySpend: 30,
        seats: 2,
        teamSize: 2,
        useCase: "writing",
      },
    ]);

    expect(
      results[0].recommendation
    ).toContain("Downgrade");

    expect(
      results[0].monthlySavings
    ).toBeGreaterThan(0);
  });

  it("detects capability mismatch for use case", () => {
    const results = runAudit([
      {
        tool: "Gemini",
        plan: "Pro",
        monthlySpend: 20,
        seats: 3,
        teamSize: 3,
        useCase: "coding",
      },
    ]);

    expect(
      results[0].recommendation
    ).toContain("better aligned");
  });

  it("detects API optimization opportunities", () => {
    const results = runAudit([
      {
        tool: "ChatGPT",
        plan: "Plus",
        monthlySpend: 20,
        seats: 8,
        teamSize: 8,
        useCase: "coding",
      },
    ]);

    expect(
      results[0].recommendation
    ).toContain("API");
  });

  it("returns honest recommendation when setup is reasonable", () => {
    const results = runAudit([
      {
        tool: "GitHub Copilot",
        plan: "Individual",
        monthlySpend: 10,
        seats: 2,
        teamSize: 2,
        useCase: "coding",
      },
    ]);

    expect(
      results[0].recommendation
    ).toContain(
      "operationally reasonable"
    );

    expect(
      results[0].monthlySavings
    ).toBe(0);
  });
});