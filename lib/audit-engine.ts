import { pricingData } from "@/data/pricing";

interface ToolSpend {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase: string;
}

export function runAudit(tools: ToolSpend[]) {
  return tools.map((tool) => {
    let recommendation = "Current setup looks optimal";
    let savings = 0;
    let reason = "No cheaper recommendation found";

    // RULE 1 — Cursor → Copilot savings
    if (
      tool.tool === "Cursor" &&
      tool.monthlySpend >= 20
    ) {
      recommendation = "Switch to GitHub Copilot Pro";
      savings = tool.monthlySpend - 10;
      reason =
        "GitHub Copilot Pro provides similar coding assistance at a lower monthly cost";
    }

    // RULE 2 — Team plan with 1 seat
    if (
      tool.plan.toLowerCase().includes("team") &&
      tool.seats <= 1
    ) {
      recommendation = `Downgrade from ${tool.plan}`;
      savings = tool.monthlySpend / 2;
      reason =
        "Team plans are inefficient for single-seat usage";
    }

    // RULE 3 — Multiple AI chats
    if (
      tool.tool === "ChatGPT" &&
      tool.monthlySpend >= 20
    ) {
      recommendation = "Evaluate Claude or Gemini";
      savings = 5;
      reason =
        "Alternative AI chat tools may reduce overlapping subscriptions";
    }

    return {
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reason,
    };
  });
}