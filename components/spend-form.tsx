"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { pricingData } from "@/data/pricing";
import { runAudit } from "@/lib/audit-engine";
import AuditResults from "@/components/audit-results";

export default function SpendForm() {
  const [tools, setTools] = useLocalStorage(
  "spendora-tools",
  [
    {
      tool: "",
      plan: "",
      monthlySpend: 0,
      seats: 1,
      useCase: "",
    },
  ]
);
  interface AuditResult {
  currentTool: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

const [results, setResults] = useState<AuditResult[]>([]);

  const addTool = () => {
    setTools([
      ...tools,
      {
        tool: "",
        plan: "",
        monthlySpend: 0,
        seats: 1,
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
    field: string,
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
                <option key={item.tool} value={item.tool}>
                  {item.tool}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Plan"
              className="rounded-lg bg-black p-3"
              value={tool.plan}
              onChange={(e) =>
                updateTool(index, "plan", e.target.value)
              }
            />

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
                updateTool(index, "seats", Number(e.target.value))
              }
            />

            <input
              type="text"
              placeholder="Use Case"
              className="rounded-lg bg-black p-3 md:col-span-2"
              value={tool.useCase}
              onChange={(e) =>
                updateTool(index, "useCase", e.target.value)
              }
            />
          </div>

          {tools.length > 1 && (
            <button
              onClick={() => removeTool(index)}
              className="mt-4 text-sm text-red-400"
            >
              Remove Tool
            </button>
          )}
        </div>
      ))}

            <button
        onClick={addTool}
        className="rounded-xl bg-white px-6 py-3 font-medium text-black"
      >
        Add Tool
      </button>

      <button
        onClick={() => {
          const auditResults = runAudit(tools);
          setResults(auditResults);
        }}
        className="ml-4 rounded-xl bg-green-500 px-6 py-3 font-medium text-black"
      >
        Analyze Spend
      </button>

      {results.length > 0 && (
        <AuditResults results={results} />
      )}
    </div>
  );
}