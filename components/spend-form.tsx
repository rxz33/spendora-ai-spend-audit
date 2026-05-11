"use client";

import { useState } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { pricingData } from "@/data/pricing";
import { runAudit } from "@/lib/audit-engine";
import { validateTool, type FormToolInput } from "@/types/forms";
import { type AuditRecommendation } from "@/types/audit";

import AuditResults from "@/components/audit-results";

function clampNonNegative(value: string): number | "" {
  if (value === "") {
    return "";
  }
  return Math.max(Number(value), 0);
}

export default function SpendForm() {
  const [tools, setTools] = useLocalStorage<FormToolInput[]>(
    "spendora-tools",
    [
      {
        tool: "",
        plan: "",
        monthlySpend: "",
        seats: "",
        teamSize: "",
        useCase: "",
      },
    ]
  );

  const [results, setResults] = useState<AuditRecommendation[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const addTool = () => {
    setTools([
      ...tools,
      {
        tool: "",
        plan: "",
        monthlySpend: "",
        seats: "",
        teamSize: "",
        useCase: "",
      },
    ]);
  };

  const removeTool = (index: number) => {
    const updated = tools.filter((_, i) => i !== index);
    setTools(updated);
  };

  const updateTool = (
    index: number,
    field: keyof FormToolInput,
    value: string | number
  ) => {
    const updated = [...tools];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setTools(updated);
  };

  const handleAudit = async () => {
    setLoading(true);

    // Validate and convert form input to proper types
    const validatedTools = tools
      .map(validateTool)
      .filter((tool): tool is Exclude<ReturnType<typeof validateTool>, null> => tool !== null);

    if (validatedTools.length === 0) {
      setLoading(false);
      return;
    }

    const auditResults = runAudit(validatedTools);
    setResults(auditResults);

    const totalMonthlySavings = auditResults.reduce((acc, item) => acc + item.monthlySavings, 0);
    const totalAnnualSavings = totalMonthlySavings * 12;

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalMonthlySavings,
          totalAnnualSavings,
          recommendations: auditResults.map((r) => ({
            tool: r.currentTool,
            currentSpend: r.currentSpend,
            recommendation: r.recommendation,
            monthlySavings: r.monthlySavings,
            reasoning: r.reason,
          })),
        }),
      });

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      setSummary(
        "Your audit identified optimization opportunities across your AI tooling stack, including plan efficiency improvements and reduced subscription overlap."
      );
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">
          Audit Workspace
        </h2>

        <p className="max-w-2xl text-slate-600">
          Analyze your organization&apos;s AI
          tooling spend and identify
          optimization opportunities across
          vendors, plans, and overlapping
          subscriptions.
        </p>
      </div>

      {tools.map((tool, index) => (
        <div
          key={index}
          className="rounded-2xl border border-sky-200/70 bg-white/75 p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">
              Tool #{index + 1}
            </h3>

            {tools.length > 1 && (
              <button
                onClick={() =>
                  removeTool(index)
                }
                className="text-sm text-red-400 transition hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-600">
                Tool
              </label>

              <select
                className="w-full rounded-lg border border-sky-100 bg-white p-3 text-slate-900"
                value={tool.tool}
                onChange={(e) =>
                  updateTool(
                    index,
                    "tool",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Tool
                </option>

                {pricingData.map((item) => (
                  <option
                    key={item.tool}
                    value={item.tool}
                  >
                    {item.tool}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-600">
                Plan
              </label>

              <select
                className="w-full rounded-lg border border-sky-100 bg-white p-3 text-slate-900"
                value={tool.plan}
                onChange={(e) =>
                  updateTool(
                    index,
                    "plan",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Plan
                </option>

                {pricingData
                  .find(
                    (item) =>
                      item.tool ===
                      tool.tool
                  )
                  ?.plans.map((plan) => (
                    <option
                      key={plan.name}
                      value={plan.name}
                    >
                      {plan.name} — $
                      {plan.monthlyPrice}
                      /mo
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-600">
                Monthly Spend ($)
              </label>

              <input
                type="number"
                min="0"
                placeholder="20"
                className="w-full rounded-lg border border-sky-100 bg-white p-3 text-slate-900"
                value={tool.monthlySpend}
                onChange={(e) =>
                  updateTool(
                    index,
                    "monthlySpend",
                    clampNonNegative(
                      e.target.value
                    )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-600">
                Seats
              </label>

              <input
                type="number"
                min="0"
                placeholder="5"
                className="w-full rounded-lg border border-sky-100 bg-white p-3 text-slate-900"
                value={tool.seats}
                onChange={(e) =>
                  updateTool(
                    index,
                    "seats",
                    clampNonNegative(
                      e.target.value
                    )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-600">
                Team Size
              </label>

              <p className="text-xs text-slate-500">
                Total people using AI tools
                across the team
              </p>

              <input
                type="number"
                min="0"
                placeholder="10"
                className="w-full rounded-lg border border-sky-100 bg-white p-3 text-slate-900"
                value={tool.teamSize}
                onChange={(e) =>
                  updateTool(
                    index,
                    "teamSize",
                    clampNonNegative(
                      e.target.value
                    )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-600">
                Use Case
              </label>

              <select
                className="w-full rounded-lg border border-sky-100 bg-white p-3 text-slate-900"
                value={tool.useCase}
                onChange={(e) =>
                  updateTool(
                    index,
                    "useCase",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Use Case
                </option>

                <option value="coding">
                  Coding
                </option>

                <option value="writing">
                  Writing
                </option>

                <option value="research">
                  Research
                </option>

                <option value="data">
                  Data
                </option>

                <option value="mixed">
                  Mixed
                </option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-4">
        <button
          onClick={addTool}
          className="rounded-xl border border-sky-200 bg-white/70 px-6 py-3 font-medium text-slate-700 transition hover:bg-white"
        >
          Add Tool
        </button>

        <button
          onClick={handleAudit}
          disabled={loading}
          className="rounded-xl bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-600 disabled:opacity-50"
        >
          {loading
            ? "Generating Audit..."
            : "Analyze Spend"}
        </button>
      </div>

      {results.length > 0 && (
        <AuditResults
          results={results}
          summary={summary}
        />
      )}
    </div>
  );
}
