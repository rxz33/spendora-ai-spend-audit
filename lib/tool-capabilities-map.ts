/**
 * Tool capability matrix
 * Used for intelligent overlap detection and workflow alignment
 */

export type ToolCapability =
  | "coding"
  | "writing"
  | "research"
  | "image-generation"
  | "voice"
  | "spreadsheets"
  | "general-chat"
  | "coding-ide"
  | "productivity";

export const TOOL_CAPABILITIES: Record<string, ToolCapability[]> = {
  // Coding tools
  Cursor: ["coding", "coding-ide", "general-chat"],
  "GitHub Copilot": ["coding", "coding-ide"],
  Windsurf: ["coding", "coding-ide"],
  "Replit": ["coding", "coding-ide"],

  // AI chat (general purpose)
  "ChatGPT": ["general-chat", "coding", "writing", "research"],
  "Claude": ["general-chat", "coding", "writing", "research"],
  "Gemini": ["general-chat", "coding", "writing", "research"],
  "Perplexity": ["research", "general-chat"],

  // Image generation
  "DALL-E": ["image-generation"],
  "Midjourney": ["image-generation"],
  "Stable Diffusion": ["image-generation"],

  // Productivity
  "Copilot Pro": ["productivity", "general-chat", "writing"],
  "Microsoft 365 Copilot": ["productivity", "writing", "spreadsheets"],
  "Google Workspace Duet": ["productivity", "writing", "spreadsheets"],

  // APIs
  "Claude API": ["general-chat", "coding", "writing", "research"],
  "OpenAI API": ["general-chat", "coding", "writing", "research"],
  "Gemini API": ["general-chat", "coding", "writing", "research"],
};

/**
 * Primary vs secondary capabilities
 * Used to determine if tools are truly overlapping or complementary
 */
export const PRIMARY_CAPABILITY: Record<string, ToolCapability> = {
  Cursor: "coding-ide",
  "GitHub Copilot": "coding-ide",
  Windsurf: "coding-ide",
  ChatGPT: "general-chat",
  Claude: "general-chat",
  Gemini: "general-chat",
  "DALL-E": "image-generation",
  Midjourney: "image-generation",
  "Copilot Pro": "productivity",
  "Claude API": "general-chat",
  "OpenAI API": "general-chat",
};

/**
 * Pricing tiers for capability assessment
 * Used to determine if a tool is oversized for its use case
 */
export const CAPABILITY_PRICE_TIERS: Record<ToolCapability, {
  free?: number;
  standard?: number;
  pro?: number;
}> = {
  "coding-ide": {
    free: 0,
    standard: 10, // Copilot
    pro: 20, // Cursor
  },
  "general-chat": {
    free: 0, // Free tier
    standard: 20, // Plus/Pro
    pro: 40, // Team
  },
  "image-generation": {
    free: 0,
    standard: 15, // Credit-based
    pro: 30, // Midjourney
  },
  coding: {
    free: 0,
    standard: 10,
    pro: 20,
  },
  writing: {
    free: 0,
    standard: 15,
    pro: 20,
  },
  research: {
    free: 0,
    standard: 15,
    pro: 20,
  },
  "voice": {
    free: 0,
    standard: 15,
    pro: 20,
  },
  "spreadsheets": {
    free: 0,
    standard: 20,
    pro: 30,
  },
  "productivity": {
    free: 0,
    standard: 20,
    pro: 40,
  },
};

/**
 * Get capabilities for a tool
 */
export function getToolCapabilities(tool: string): ToolCapability[] {
  return TOOL_CAPABILITIES[tool] || [];
}

/**
 * Check if two tools have overlapping capabilities
 */
export function hasCapabilityOverlap(tool1: string, tool2: string): boolean {
  const caps1 = new Set(getToolCapabilities(tool1));
  const caps2 = new Set(getToolCapabilities(tool2));

  for (const cap of caps1) {
    if (caps2.has(cap)) {
      return true;
    }
  }

  return false;
}

/**
 * Get primary competitive alternatives for a tool
 * (Tools that can fully replace this tool)
 */
export function getCompetitiveAlternatives(tool: string): string[] {
  const capabilities = getToolCapabilities(tool);
  const primary = PRIMARY_CAPABILITY[tool];

  return Object.entries(PRIMARY_CAPABILITY)
    .filter(
      ([altTool, altPrimary]) =>
        altTool !== tool &&
        altPrimary === primary &&
        capabilities.some((c) =>
          getToolCapabilities(altTool).includes(c)
        )
    )
    .map(([tool]) => tool);
}

/**
 * Determine if a capability mismatch exists
 * (Tool's primary capability doesn't match use case)
 */
export function hasCapabilityMismatch(
  tool: string,
  useCase: string
): boolean {
  const capabilities = getToolCapabilities(tool);
  const useCaseCap = useCase.toLowerCase();

  // Exact match is fine
  if (capabilities.some((c) => c.includes(useCaseCap))) {
    return false;
  }

  // Map common use cases to capabilities
  const useCaseMapping: Record<string, ToolCapability[]> = {
    coding: ["coding", "coding-ide"],
    writing: ["writing", "general-chat"],
    research: ["research", "general-chat"],
    "image-gen": ["image-generation"],
    "image generation": ["image-generation"],
    productivity: ["productivity"],
    "general chat": ["general-chat"],
  };

  const mappedCaps = useCaseMapping[useCaseCap] || [];
  if (mappedCaps.length === 0) return false; // Unknown use case, assume OK

  return !mappedCaps.some((cap) => capabilities.includes(cap));
}
