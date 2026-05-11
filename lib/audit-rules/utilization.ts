import { type UtilizationRule } from "@/types/audit-rules";

/**
 * Utilization Rules
 * Detect underutilized subscriptions
 */

export const utilizationRules: UtilizationRule[] = [
  {
    id: "low-team-adoption",
    condition: (teamSize: number, seats: number, _monthlySpend: number) => seats > 0 && (seats / teamSize) < 0.3,
    recommendation:
      "Reduce seat allocation or downgrade plan tier — only 30% of team uses tool.",
    reason:
      "Tool allocated to team but <30% actively use it. Suggests poor adoption, wrong tool fit, or inactive subscriptions. Reduce seats or downgrade for savings.",
    estimatedSavings: (monthlySpend: number) => Math.round(monthlySpend * 0.4),
  },

  {
    id: "high-spend-low-usage",
    condition: (teamSize: number, seats: number, monthlySpend: number) =>
      monthlySpend > 50 && teamSize <= 3,
    recommendation:
      "Downgrade to appropriate plan tier for team size.",
    reason:
      "High monthly spend ($50+) for small team (<3 people) suggests oversized plan. Most tools have smaller plans. Typical savings: $20-30/month.",
    estimatedSavings: 25,
  },

  {
    id: "unused-premium-seats",
    condition: (teamSize: number, seats: number, _monthlySpend: number) => seats > teamSize,
    recommendation:
      "Remove unused seat allocations (allocated seats > actual team size).",
    reason:
      "Allocated seats exceed team size. Likely orphaned accounts from past hiring plan. Remove unused seats for immediate savings. Typical savings: $10-30/month.",
    estimatedSavings: 20,
  },
];
