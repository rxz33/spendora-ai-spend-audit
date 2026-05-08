import { toolCapabilities } from "./tool-capabilities";
import { inefficientPlanRules } from "./plan-rules";
import { creditOptimizations } from "./credit-optimization";

interface ToolSpend {
  tool: string;
  plan: string;
  monthlySpend: number;
  teamSize: number;
  seats: number;
  useCase: string;
}

interface AuditResult {
  currentTool: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

export function runAudit(
  tools: ToolSpend[]
): AuditResult[] {
  return tools.map((tool) => {
    let recommendation =
      "Current setup appears operationally reasonable";

    let savings = 0;

    let reason =
      "No significant optimization opportunities detected based on current usage inputs.";

    /*
      RULE 1 — Inefficient team plans
    */

    const inefficientRule =
      inefficientPlanRules.find(
        (rule) =>
          rule.tool === tool.tool &&
          rule.plan === tool.plan &&
          tool.teamSize <=
            rule.maxEfficientSeats
      );

    if (inefficientRule) {
      savings =
        tool.monthlySpend -
        inefficientRule.suggestedMonthlyCost;

      recommendation =
        inefficientRule.recommendation;

      reason = inefficientRule.reason;

      return {
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend:
          tool.monthlySpend,

        recommendation,

        monthlySavings: Math.max(
          savings,
          0
        ),

        annualSavings:
          Math.max(savings, 0) * 12,

        reason,
      };
    }

    /*
      RULE 2 — Cursor → Copilot optimization
    */

    if (
      tool.tool === "Cursor" &&
      tool.monthlySpend >= 20 &&
      tool.useCase === "coding"
    ) {
      recommendation =
        "Evaluate GitHub Copilot Individual";

      savings =
        tool.monthlySpend - 10;

      reason =
        "GitHub Copilot Individual may provide comparable coding assistance at a lower monthly operational cost for smaller engineering teams.";
    }

    /*
      RULE 3 — AI chat overlap detection
    */

    if (
      (tool.tool === "ChatGPT" ||
        tool.tool === "Claude") &&
      tool.monthlySpend >= 20
    ) {
      recommendation =
        "Evaluate consolidating overlapping AI chat subscriptions";

      savings = 10;

      reason =
        "Many teams maintain redundant AI chat subscriptions with overlapping functionality across writing, research, and general productivity workflows.";
    }

    /*
      RULE 4 — Capability mismatch
    */

    const supportedUseCases =
      toolCapabilities[
        tool.tool as keyof typeof toolCapabilities
      ];

    if (
      supportedUseCases &&
      !supportedUseCases.includes(
        tool.useCase
      ) &&
      tool.useCase !== "mixed"
    ) {
      recommendation =
        "Evaluate tools better aligned with the team's primary workflow";

      savings = 5;

      reason =
        "The selected tool may not be optimally aligned with the team's stated primary use case.";
    }

    /*
      RULE 5 — API / credits optimization
    */

    const creditOptimization =
      creditOptimizations.find(
        (optimization) =>
          optimization.sourceTool ===
            tool.tool &&
          optimization.useCase ===
            tool.useCase
      );

    if (
      creditOptimization &&
      tool.teamSize >= 5
    ) {
      recommendation =
        creditOptimization.recommendation;

      savings = Math.max(
        savings,
        15
      );

      reason =
        creditOptimization.reason;
    }

    return {
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,

      recommendation,

      monthlySavings: Math.max(
        savings,
        0
      ),

      annualSavings:
        Math.max(savings, 0) * 12,

      reason,
    };
  });
}