import { type OverlapRule } from "@/types/audit-rules";

/**
 * Subscription Overlap Rules
 * Detect redundant tools within same category
 */

export const overlapRules: OverlapRule[] = [
  {
    id: "chat-overlap-chatgpt-claude",
    tools: ["ChatGPT", "Claude"],
    recommendation:
      "Consolidate to single AI chat tool (retain primary, cancel secondary).",
    reason:
      "ChatGPT + Claude have 85%+ overlapping capability for general conversation, writing, coding assistance, research. Keeping both wastes ~$20-40/month. Recommendation: Keep tool matching primary workflow, cancel other.",
    estimatedSavings: 20,
  },

  {
    id: "chat-overlap-claude-gemini",
    tools: ["Claude", "Gemini"],
    recommendation: "Consolidate to Claude (better coding + writing).",
    reason:
      "Claude ($20/mo Pro) outperforms Gemini ($20/mo Pro) on coding and technical writing. Consolidating to Claude and canceling Gemini eliminates redundancy. Savings: $20/month.",
    estimatedSavings: 20,
  },

  {
    id: "coding-tool-overlap",
    tools: ["Cursor", "GitHub Copilot", "Windsurf"],
    recommendation:
      "Retain single coding IDE tool based on team preference.",
    reason:
      "Cursor ($20/mo), GitHub Copilot ($10/mo), and Windsurf ($15/mo) serve identical purpose — AI-assisted coding. Maintaining multiple wastes $25-45/month. Recommendation: Pick one, cancel others.",
    estimatedSavings: 25,
  },

  {
    id: "image-generation-overlap",
    tools: ["DALL-E", "Midjourney"],
    recommendation: "Consolidate to single image generation tool.",
    reason:
      "DALL-E ($15/mo credits) + Midjourney ($30/mo) overlap significantly. Most teams need only one. Savings: $15-30/month by keeping single tool.",
    estimatedSavings: 22,
  },
];
