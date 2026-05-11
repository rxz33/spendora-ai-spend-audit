import { type WorkflowRule } from "@/types/audit-rules";

/**
 * Workflow Alignment Rules
 * Detect tool-to-usecase mismatch
 */

export const workflowRules: WorkflowRule[] = [
  {
    id: "coding-tool-for-writing",
    useCase: "writing",
    incompatibleTools: ["Cursor", "GitHub Copilot", "Windsurf"],
    recommendation:
      "Use writing-focused tool (Claude, ChatGPT) instead of coding IDE.",
    reason:
      "Cursor ($20/mo) is optimized for coding, not writing. Claude ($20/mo) or ChatGPT ($20/mo) are better for document generation. Consider switching tools for better fit.",
    estimatedSavings: 0, // Same price, but better fit
  },

  {
    id: "writing-tool-for-coding",
    useCase: "coding",
    incompatibleTools: ["Claude", "ChatGPT", "Gemini"],
    recommendation:
      "Use specialized coding tool (Cursor, Copilot) — better aligned for coding workflows.",
    reason:
      "General chat tools (Claude, ChatGPT) lack IDE integration. Cursor ($20/mo) or Copilot ($10/mo) provide better coding experience + lower cost (Copilot). Switch to save $0-10/month.",
    estimatedSavings: 5,
  },

  {
    id: "general-tool-for-specialized-task",
    useCase: "research",
    incompatibleTools: ["Cursor", "GitHub Copilot"],
    recommendation:
      "Switch to general AI chat tool for research + browsing.",
    reason:
      "Coding IDEs lack web search + research features. ChatGPT Plus ($20/mo) or Claude Pro ($20/mo) with web browsing are better. Avoid overpaying for specialized tools.",
    estimatedSavings: 0,
  },
];
