import { type PaymentRule } from "@/types/audit-rules";

/**
 * Payment Method & Discount Rules
 * Detect payment optimization opportunities
 */

export const paymentRules: PaymentRule[] = [
  {
    id: "annual-vs-monthly",
    condition: (_teamSize: number) => true, // Applies to all subscriptions
    recommendation:
      "Switch to annual billing to unlock 15-20% discount.",
    reason:
      "Most AI tools (ChatGPT, Claude, Cursor, Copilot) offer 15-20% discounts for annual upfront payment. Typical savings: $3-5/month per subscription if switching to annual.",
    estimatedSavings: (monthlySpend: number) => Math.round(monthlySpend * 0.15),
  },

  {
    id: "educational-discount",
    condition: (teamSize: number) => teamSize === 1, // Individual or student
    recommendation:
      "Verify eligibility for educational/student pricing.",
    reason:
      "Students, educators, and academic researchers often qualify for 30-50% discounts on Claude, ChatGPT, Cursor. If eligible, savings: $5-15/month.",
    estimatedSavings: 10,
  },

  {
    id: "nonprofit-discount",
    condition: (_teamSize: number) => true,
    recommendation:
      "If nonprofit: apply for nonprofit/non-profit discounts (30-50% off).",
    reason:
      "Many AI vendors offer 30-50% discounts for registered nonprofits. Check eligibility with OpenAI, Anthropic, GitHub. Typical savings: $10-30/month.",
    estimatedSavings: 15,
  },

  {
    id: "family-plan-bundling",
    condition: (teamSize: number) => teamSize >= 3 && teamSize <= 6,
    recommendation:
      "Explore family or group plan bundles instead of individual subscriptions.",
    reason:
      "Some vendors offer family (5-6 people) or group plans at 20-30% discount vs individual subscriptions. Could save $10-20/month.",
    estimatedSavings: 15,
  },
];
