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
 * Converts form input to validated data
 * Returns null if validation fails
 */
export function validateTool(input: FormToolInput): ValidatedTool | null {
  if (
    input.tool.length === 0 ||
    input.plan.length === 0 ||
    Number(input.monthlySpend) < 0 ||
    Number(input.seats) < 0 ||
    Number(input.teamSize) < 0 ||
    input.useCase.length === 0
  ) {
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
