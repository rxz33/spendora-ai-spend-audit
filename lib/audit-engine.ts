import { type ToolSpend, type AuditRecommendation } from "@/types/audit";
import {
  planEfficiencyRules,
  overlapRules,
  toolSwapRules,
  utilizationRules,
  workflowRules,
  paymentRules,
  strategyRules,
} from "./audit-rules";

function getSavings(
  estimatedSavings: number | ((value: number) => number),
  value: number
): number {
  return typeof estimatedSavings === "function" ? estimatedSavings(value) : estimatedSavings;
}

export function runAudit(tools: ToolSpend[]): AuditRecommendation[] {
  return tools.map((tool) => {
    // RULE 1-4: Plan Efficiency
    const planRule = planEfficiencyRules.find(
      (rule) =>
        (rule.tool === null || rule.tool === tool.tool) &&
        (rule.plan === null || rule.plan === tool.plan) &&
        tool.teamSize <= rule.maxEfficientSeats
    );

    if (planRule) {
      const savings = planRule.suggestedMonthlyCost
        ? tool.monthlySpend - planRule.suggestedMonthlyCost
        : getSavings(planRule.estimatedSavings, tool.teamSize);

      return {
        type: "plan-downgrade",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: planRule.recommendation,
        monthlySavings: Math.max(savings, 0),
        annualSavings: Math.max(savings, 0) * 12,
        reason: planRule.reason,
      };
    }

    // RULE 5-8: Subscription Overlap Detection
    const overlap = overlapRules.find(
      (rule) =>
        rule.tools.some((t) => t === tool.tool) &&
        tools.some(
          (t) =>
            rule.tools.includes(t.tool) &&
            t.tool !== tool.tool &&
            Math.abs(t.monthlySpend - tool.monthlySpend) < 50
        )
    );

    if (overlap) {
      return {
        type: "consolidate-overlap",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: overlap.recommendation,
        monthlySavings: overlap.estimatedSavings,
        annualSavings: overlap.estimatedSavings * 12,
        reason: overlap.reason,
      };
    }

    // RULE 9-13: Tool Swap Opportunities
    const swapRule = toolSwapRules.find((rule) => {
      const fromMatches = rule.from === tool.tool;
      const conditionMet = !rule.condition || rule.condition(tool.useCase, tool.teamSize, tool.monthlySpend);
      return fromMatches && conditionMet;
    });

    if (swapRule) {
      return {
        type: "tool-switch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: swapRule.recommendation,
        monthlySavings: Math.max(swapRule.estimatedSavings, 0),
        annualSavings: Math.max(swapRule.estimatedSavings, 0) * 12,
        reason: swapRule.reason,
      };
    }

    // RULE 14-16: Utilization Analysis
    const utilizationRule = utilizationRules.find((rule) =>
      rule.condition(tool.teamSize, tool.seats, tool.monthlySpend)
    );

    if (utilizationRule) {
      const savings = getSavings(utilizationRule.estimatedSavings, tool.monthlySpend);

      return {
        type: "capability-mismatch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: utilizationRule.recommendation,
        monthlySavings: Math.max(savings, 0),
        annualSavings: Math.max(savings, 0) * 12,
        reason: utilizationRule.reason,
      };
    }

    // RULE 17-19: Workflow Alignment
    const workflowRule = workflowRules.find(
      (rule) =>
        rule.useCase === tool.useCase &&
        rule.incompatibleTools.includes(tool.tool)
    );

    if (workflowRule) {
      return {
        type: "capability-mismatch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: workflowRule.recommendation,
        monthlySavings: Math.max(workflowRule.estimatedSavings, 0),
        annualSavings: Math.max(workflowRule.estimatedSavings, 0) * 12,
        reason: workflowRule.reason,
      };
    }

    // Default: No optimization found
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