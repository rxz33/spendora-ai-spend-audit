import { type PlanEfficiencyRule } from "@/types/audit-rules";
import { getPlanPrice } from "@/lib/utils";

/**
 * Plan Efficiency Rules
 * Detect when team is paying for oversized plans
 */

export const planEfficiencyRules: PlanEfficiencyRule[] = [
  {
    id: "plan-downgrade-team-to-pro",
    tool: "ChatGPT",
    plan: "Team",
    maxEfficientSeats: 2,
    recommendation: "Downgrade to ChatGPT Plus",
    reason:
      "ChatGPT Team ($30/user/month) is oversized for teams ≤2 people. ChatGPT Plus ($20/month per person) provides identical capabilities. Savings: $10-40/month depending on team size.",
    suggestedMonthlyCost: getPlanPrice("ChatGPT", "Plus") || 20,
    estimatedSavings: (_teamSize: number) => Math.max((getPlanPrice("ChatGPT", "Team") || 30) - (getPlanPrice("ChatGPT", "Plus") || 20), 0),
  },

  {
    id: "plan-downgrade-claude-team-to-pro",
    tool: "Claude",
    plan: "Team",
    maxEfficientSeats: 2,
    recommendation: "Downgrade to Claude Pro",
    reason:
      "Claude Team ($30/user/month) is unnecessary for small teams. Claude Pro ($20/month) covers individual usage. Savings: $10-40/month.",
    suggestedMonthlyCost: getPlanPrice("Claude", "Pro") || 20,
    estimatedSavings: (_teamSize: number) => Math.max((getPlanPrice("Claude", "Team") || 30) - (getPlanPrice("Claude", "Pro") || 20), 0),
  },

  {
    id: "plan-downgrade-cursor-business",
    tool: "Cursor",
    plan: "Business",
    maxEfficientSeats: 3,
    recommendation: "Downgrade to Cursor Pro",
    reason:
      "Cursor Business ($40/month) is designed for larger teams with centralized billing. For ≤3 developers, Cursor Pro ($20/month) is more cost-effective. Savings: $20/month.",
    suggestedMonthlyCost: getPlanPrice("Cursor", "Pro") || 20,
    estimatedSavings: (_teamSize: number) => (getPlanPrice("Cursor", "Business") || 40) - (getPlanPrice("Cursor", "Pro") || 20),
  },

  {
    id: "free-tier-available",
    tool: "Claude",
    plan: "Pro",
    maxEfficientSeats: 1,
    recommendation: "Use Claude Free tier for light usage",
    reason:
      "Claude Free tier provides 50+ daily messages — adequate for casual users. Only upgrade to Pro ($20/month) if you consistently hit limits. Savings: $20/month if staying on free.",
    suggestedMonthlyCost: 0,
    estimatedSavings: (_teamSize: number) => 20,
  },
];
