import { type StrategyRule } from "@/types/audit-rules";

/**
 * Advanced Strategy Rules
 * Detect opportunities for intelligent switching or hybrid approaches
 */

export const strategyRules: StrategyRule[] = [
  {
    id: "freemium-tier-sufficient",
    tool: null,
    condition: (monthlySpend: number, _teamSize: number) => monthlySpend >= 20,
    recommendation:
      "Evaluate whether free or freemium tier meets your actual needs.",
    reason:
      "Many individuals pay for Pro tiers ($20/mo) but only use 10-20% of premium features. Claude Free, ChatGPT Free, or Gemini Free may suffice. Potential savings: $20/month.",
    estimatedSavings: 20,
  },

  {
    id: "usage-monitoring-needed",
    tool: null,
    condition: (monthlySpend: number, _teamSize: number) => monthlySpend >= 30,
    recommendation:
      "Implement usage tracking to identify unused subscriptions.",
    reason:
      "Teams paying $30+/month often have 'zombie' subscriptions (signed up but not used). Without tracking, waste accumulates. Estimated 10-20% of spend is wasted. Savings: $3-6/month if monitored.",
    estimatedSavings: 5,
  },

  {
    id: "api-vs-subscription-hybrid",
    tool: null,
    condition: (monthlySpend: number, teamSize: number) => teamSize >= 3 && monthlySpend >= 50,
    recommendation:
      "Hybrid approach: API for heavy users, free tier for light users.",
    reason:
      "For teams with mixed usage (some power users, many casual users), hybrid saves 40-60% vs everyone on paid plans. Power users on API, others on free tier. Savings: $30-40/month.",
    estimatedSavings: 35,
  },

  {
    id: "competitor-trial-rotation",
    tool: null,
    condition: (monthlySpend: number, _teamSize: number) => monthlySpend >= 20,
    recommendation:
      "Use free trials (ChatGPT 3-day, Claude free) for occasional needs instead of permanent subscriptions.",
    reason:
      "For casual users with infrequent needs, using free trials + extended free tiers can eliminate permanent subscriptions. Savings: $20/month.",
    estimatedSavings: 20,
  },
];
