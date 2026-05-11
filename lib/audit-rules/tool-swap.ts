import { type ToolSwapRule } from "@/types/audit-rules";

/**
 * Tool Swap Rules
 * Detect cheaper alternatives for same capability
 */

export const toolSwapRules: ToolSwapRule[] = [
  {
    id: "cursor-to-copilot",
    from: "Cursor",
    to: "GitHub Copilot",
    fromPrice: 20,
    toPrice: 10,
    condition: (useCase: string, _teamSize: number, _monthlySpend: number) => useCase === "coding",
    recommendation: "Consider GitHub Copilot Individual ($10/mo) as Cursor alternative.",
    reason:
      "Both provide VSCode-integrated AI coding. GitHub Copilot is half the price ($10 vs $20). Coding quality similar for non-advanced use cases. Savings: $10/month.",
    estimatedSavings: 10,
  },

  {
    id: "claude-pro-to-api",
    from: "Claude",
    to: "Claude API",
    fromPrice: 20,
    toPrice: 0.01, // Per-use pricing
    condition: (_useCase: string, teamSize: number, monthlySpend: number) => teamSize >= 5 && monthlySpend >= 20,
    recommendation: "Evaluate Claude API for heavy usage teams (5+ people).",
    reason:
      "Claude API token pricing ($3/$15 per 1M in/out tokens) is 50-100x cheaper than Pro for typical usage. A 5-person team on Pro pays $100/mo but could use API for ~$5-10/mo. Savings: $90/month.",
    estimatedSavings: 90,
  },

  {
    id: "chatgpt-plus-to-api",
    from: "ChatGPT",
    to: "OpenAI API",
    fromPrice: 20,
    toPrice: 0.001,
    condition: (_useCase: string, teamSize: number, monthlySpend: number) => teamSize >= 5 && monthlySpend >= 20,
    recommendation: "Consolidate to OpenAI API for team usage (vs individual ChatGPT Plus).",
    reason:
      "OpenAI API ($0.15/$0.60 per 1M tokens) is much cheaper than ChatGPT Plus ($20/mo) for moderate usage. 8-person team could save $150+/month. Savings: $160/month.",
    estimatedSavings: 160,
  },

  {
    id: "gemini-pro-to-free",
    from: "Gemini",
    to: "Gemini Free",
    fromPrice: 20,
    toPrice: 0,
    condition: (_useCase: string, teamSize: number, _monthlySpend: number) => teamSize <= 2,
    recommendation: "Use Gemini Free tier for light usage instead of Pro.",
    reason:
      "Gemini Free provides adequate capability for casual users. Pro ($20/mo) only needed for heavy usage. Savings: $20/month if staying on free.",
    estimatedSavings: 20,
  },

  {
    id: "windsurf-to-copilot",
    from: "Windsurf",
    to: "GitHub Copilot",
    fromPrice: 15,
    toPrice: 10,
    condition: (useCase: string, _teamSize: number, _monthlySpend: number) => useCase === "coding",
    recommendation: "Switch to GitHub Copilot Individual ($10/mo).",
    reason:
      "Windsurf ($15/mo) and GitHub Copilot ($10/mo) have similar VSCode integration. Copilot has larger community + better pricing. Savings: $5/month.",
    estimatedSavings: 5,
  },
];
