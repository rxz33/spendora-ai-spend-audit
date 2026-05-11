/**
 * Form types - represent raw form input (may have empty strings)
 */

export interface FormToolInput {
  tool: string;
  plan: string;
  monthlySpend: string; // ← Always string in form
  seats: string;
  teamSize: string;
  useCase: string;
}

/**
 * Validated types - all values are properly typed after validation
 */

export interface ValidatedTool {
  tool: string;
  plan: string;
  monthlySpend: number; // ← Parsed to number
  seats: number;
  teamSize: number;
  useCase: string;
}

/**
 * Type guard to validate form input
 */
export function isValidTool(tool: FormToolInput): tool is ValidatedTool {
  return (
    tool.tool.length > 0 &&
    tool.plan.length > 0 &&
    Number(tool.monthlySpend) >= 0 &&
    Number(tool.seats) >= 0 &&
    Number(tool.teamSize) >= 0 &&
    tool.useCase.length > 0
  );
}

/**
 * Converts form input to validated data
 */
export function validateTool(input: FormToolInput): ValidatedTool | null {
  if (!isValidTool(input)) {
    return null;
  }

  return {
    tool: input.tool,
    plan: input.plan,
    monthlySpend: Math.max(Number(input.monthlySpend), 0),
    seats: Math.max(Number(input.seats), 0),
    teamSize: Math.max(Number(input.teamSize), 0),
    useCase: input.useCase,
  };
}
