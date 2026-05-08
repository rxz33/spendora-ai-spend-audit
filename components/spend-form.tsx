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
  monthlySpend: number;
  seats: number;
  teamSize: number;
  useCase: string;
}

export default function SpendForm() {
  const [tools, setTools] = useLocalStorage<ToolInput[]>(
    "spendora-tools",
    [
      {
        tool: "",
        plan: "",
        monthlySpend: 0,
        seats: 1,
        teamSize: 1,
        useCase: "",
      },
    ]
  );

  const [results, setResults] = useState<AuditResult[]>([]);

  const addTool = () => {
    setTools([
      ...tools,
      {
        tool: "",
        plan: "",
        monthlySpend: 0,
        seats: 1,
        teamSize: 1,
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
    <div className="space-y-6">
      {tools.map((tool, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="rounded-lg bg-black p-3"
              value={tool.tool}
              onChange={(e) =>
                updateTool(index, "tool", e.target.value)
              }
            >
              <option value="">Select Tool</option>

              {pricingData.map((item) => (
                <option
                  key={item.tool}
                  value={item.tool}
                >
                  {item.tool}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg bg-black p-3"
              value={tool.plan}
              onChange={(e) =>
                updateTool(index, "plan", e.target.value)
              }
            >
              <option value="">
                Select Plan
              </option>

              {pricingData
                .find(
                  (item) => item.tool === tool.tool
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

            <input
              type="number"
              placeholder="Monthly Spend"
              className="rounded-lg bg-black p-3"
              value={tool.monthlySpend}
              onChange={(e) =>
                updateTool(
                  index,
                  "monthlySpend",
                  Number(e.target.value)
                )
              }
            />

            <input
              type="number"
              placeholder="Seats"
              className="rounded-lg bg-black p-3"
              value={tool.seats}
              onChange={(e) =>
                updateTool(
                  index,
                  "seats",
                  Number(e.target.value)
                )
              }
            />

            <input
              type="number"
              placeholder="Team Size"
              className="rounded-lg bg-black p-3"
              value={tool.teamSize}
              onChange={(e) =>
                updateTool(
                  index,
                  "teamSize",
                  Number(e.target.value)
                )
              }
            />

            <select
              className="rounded-lg bg-black p-3"
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

          <p className="mt-4 text-sm text-white/60">
            Estimated Monthly Cost:
            <span className="ml-2 font-semibold text-white">
              $
              {(
                tool.monthlySpend * tool.seats
              ).toFixed(0)}
              /mo
            </span>
          </p>

          {tools.length > 1 && (
            <button
              onClick={() =>
                removeTool(index)
              }
              className="mt-4 text-sm text-red-400"
            >
              Remove Tool
            </button>
          )}
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={addTool}
          className="rounded-xl bg-white px-6 py-3 font-medium text-black"
        >
          Add Tool
        </button>

        <button
          onClick={() => {
            const auditResults =
              runAudit(tools);

            setResults(auditResults);
          }}
          className="rounded-xl bg-green-500 px-6 py-3 font-medium text-black"
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