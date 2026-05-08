export const inefficientPlanRules = [
  {
    tool: "ChatGPT",
    plan: "Team",
    maxEfficientSeats: 2,

    recommendation:
      "Downgrade to ChatGPT Plus",

    reason:
      "ChatGPT Team plans become difficult to justify for very small teams without collaboration or admin requirements.",

    suggestedMonthlyCost: 20,
  },

  {
    tool: "Claude",
    plan: "Team",
    maxEfficientSeats: 2,

    recommendation:
      "Downgrade to Claude Pro",

    reason:
      "Claude Team pricing may be oversized for smaller teams with limited collaboration workflows.",

    suggestedMonthlyCost: 20,
  },

  {
    tool: "Cursor",
    plan: "Business",
    maxEfficientSeats: 3,

    recommendation:
      "Downgrade to Cursor Pro",

    reason:
      "Cursor Business is generally more cost-effective for larger engineering teams requiring centralized administration.",

    suggestedMonthlyCost: 20,
  },
];