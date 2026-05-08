"use client";

import { useState } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { pricingData } from "@/data/pricing";
import { runAudit } from "@/lib/audit-engine";

import AuditResults from "@/components/audit-results";

interface AuditResult {
  currentTool: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

interface ToolInput {
  tool: string;
  plan: string;
  monthlySpend: number | "";
  seats: number | "";
  teamSize: number | "";
  useCase: string;
}

interface SanitizedToolInput {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  teamSize: number;
  useCase: string;
}

export default function SpendForm() {
  const [tools, setTools] =
    useLocalStorage<ToolInput[]>(
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

  const [results, setResults] = useState<
    AuditResult[]
  >([]);

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
    const updated = tools.filter(
      (_, i) => i !== index
    );

    setTools(updated);
  };

  const updateTool = (
    index: number,
    field: keyof ToolInput,
    value: string | number
  ) => {
    const updated = [...tools];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setTools(updated);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">
          Audit Workspace
        </h2>

        <p className="max-w-2xl text-white/60">
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
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold">
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
              <label className="text-sm text-white/60">
                Tool
              </label>

              <select
                className="w-full rounded-lg bg-black p-3"
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
              <label className="text-sm text-white/60">
                Plan
              </label>

              <select
                className="w-full rounded-lg bg-black p-3"
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
      item.tool === tool.tool
  )
  ?.plans.map((plan) => (
    <option
      key={plan.name}
      value={plan.name}
    >
      {plan.name} — $
      {plan.monthlyPrice}/mo
    </option>
  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Monthly Spend ($)
              </label>

              <input
                type="number"
                placeholder="20"
                className="w-full rounded-lg bg-black p-3"
                value={tool.monthlySpend}
                onChange={(e) =>
                  updateTool(
                    index,
                    "monthlySpend",
                    e.target.value === ""
                      ? ""
                      : Number(
                          e.target.value
                        )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Seats
              </label>

              <input
                type="number"
                placeholder="5"
                className="w-full rounded-lg bg-black p-3"
                value={tool.seats}
                onChange={(e) =>
                  updateTool(
                    index,
                    "seats",
                    e.target.value === ""
                      ? ""
                      : Number(
                          e.target.value
                        )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Team Size
              </label>

              <p className="text-xs text-white/40">
                Total people using AI tools
                across the team
              </p>

              <input
                type="number"
                placeholder="10"
                className="w-full rounded-lg bg-black p-3"
                value={tool.teamSize}
                onChange={(e) =>
                  updateTool(
                    index,
                    "teamSize",
                    e.target.value === ""
                      ? ""
                      : Number(
                          e.target.value
                        )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">
                Use Case
              </label>

              <select
                className="w-full rounded-lg bg-black p-3"
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

          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-white/60">
              Estimated Monthly Cost
            </p>

            <p className="mt-1 text-2xl font-bold">
              $
              {(
                Number(
                  tool.monthlySpend || 0
                ) *
                Number(tool.seats || 0)
              ).toFixed(0)}
              /mo
            </p>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-4">
        <button
          onClick={addTool}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium transition hover:bg-white/10"
        >
          Add Tool
        </button>

        <button
          onClick={() => {
            const sanitizedTools: SanitizedToolInput[] =
  tools.map((tool) => ({
    tool: tool.tool,
    plan: tool.plan,

    monthlySpend: Number(
      tool.monthlySpend || 0
    ),

    seats: Number(
      tool.seats || 0
    ),

    teamSize: Number(
      tool.teamSize || 0
    ),

    useCase: tool.useCase,
  }));

            const auditResults =
              runAudit(sanitizedTools);

            setResults(auditResults);
          }}
          className="rounded-xl bg-green-500 px-6 py-3 font-medium text-black transition hover:bg-green-400"
        >
          Analyze Spend
        </button>
      </div>

      {results.length > 0 && (
        <AuditResults results={results} />
      )}
    </div>
  );
}