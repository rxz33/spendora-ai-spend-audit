import { toolCapabilities } from "./tool-capabilities";
import { inefficientPlanRules } from "./plan-rules";
import { creditOptimizations } from "./credit-optimization";
import { type ToolSpend, type AuditRecommendation } from "@/types/audit";

export function runAudit(tools: ToolSpend[]): AuditRecommendation[] {
  return tools.map((tool) => {
    // RULE 1 — Inefficient team plans
    const inefficientRule = inefficientPlanRules.find(
      (rule) =>
        rule.tool === tool.tool &&
        rule.plan === tool.plan &&
        tool.teamSize <= rule.maxEfficientSeats
    );

    if (inefficientRule) {
      const savings = tool.monthlySpend - inefficientRule.suggestedMonthlyCost;
      return {
        type: "plan-downgrade",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: inefficientRule.recommendation,
        monthlySavings: Math.max(savings, 0),
        annualSavings: Math.max(savings, 0) * 12,
        reason: inefficientRule.reason,
      };
    }

    // RULE 2 — Cursor → Copilot optimization
    if (tool.tool === "Cursor" && tool.monthlySpend >= 20 && tool.useCase === "coding") {
      const savings = tool.monthlySpend - 10;
      return {
        type: "tool-switch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: "Evaluate GitHub Copilot Individual",
        monthlySavings: Math.max(savings, 0),
        annualSavings: Math.max(savings, 0) * 12,
        reason:
          "GitHub Copilot Individual may provide comparable coding assistance at a lower monthly operational cost for smaller engineering teams.",
      };
    }

    // RULE 3 — AI chat overlap detection
    if (
      (tool.tool === "ChatGPT" || tool.tool === "Claude") &&
      tool.monthlySpend >= 20
    ) {
      return {
        type: "consolidate-overlap",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: "Evaluate consolidating overlapping AI chat subscriptions",
        monthlySavings: 10,
        annualSavings: 120,
        reason:
          "Many teams maintain redundant AI chat subscriptions with overlapping functionality across writing, research, and general productivity workflows.",
      };
    }

    // RULE 4 — Capability mismatch
    const supportedUseCases = toolCapabilities[tool.tool as keyof typeof toolCapabilities];

    if (
      supportedUseCases &&
      !supportedUseCases.includes(tool.useCase) &&
      tool.useCase !== "mixed"
    ) {
      return {
        type: "capability-mismatch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: "Evaluate tools better aligned with the team's primary workflow",
        monthlySavings: 5,
        annualSavings: 60,
        reason: "The selected tool may not be optimally aligned with the team's stated primary use case.",
      };
    }

    // RULE 5 — API / credits optimization
    const creditOptimization = creditOptimizations.find(
      (optimization) =>
        optimization.sourceTool === tool.tool && optimization.useCase === tool.useCase
    );

    if (creditOptimization && tool.teamSize >= 5) {
      return {
        type: "api-optimization",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: creditOptimization.recommendation,
        monthlySavings: 15,
        annualSavings: 180,
        reason: creditOptimization.reason,
      };
    }

    // No savings found
    return {
      type: "no-savings",
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation: "Current setup appears operationally reasonable",
      reason: "No significant optimization opportunities detected based on current usage inputs.",
      monthlySavings: 0,
      annualSavings: 0,
    };
  });
}