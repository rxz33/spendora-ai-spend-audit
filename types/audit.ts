/**
 * Input to audit engine - already validated
 */
export interface ToolSpend {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  teamSize: number;
  useCase: string;
}

/**
 * Discriminated union for audit recommendations
 * Forces exhaustive handling of all cases
 */
export type AuditRecommendation =
  | {
      type: "no-savings";
      currentTool: string;
      currentPlan: string;
      currentSpend: number;
      recommendation: string;
      reason: string;
      monthlySavings: 0;
      annualSavings: 0;
    }
  | {
      type: "plan-downgrade";
      currentTool: string;
      currentPlan: string;
      currentSpend: number;
      recommendation: string;
      monthlySavings: number;
      annualSavings: number;
      reason: string;
    }
  | {
      type: "tool-switch";
      currentTool: string;
      currentPlan: string;
      currentSpend: number;
      recommendation: string;
      monthlySavings: number;
      annualSavings: number;
      reason: string;
    }
  | {
      type: "consolidate-overlap";
      currentTool: string;
      currentPlan: string;
      currentSpend: number;
      recommendation: string;
      monthlySavings: number;
      annualSavings: number;
      reason: string;
    }
  | {
      type: "capability-mismatch";
      currentTool: string;
      currentPlan: string;
      currentSpend: number;
      recommendation: string;
      monthlySavings: number;
      annualSavings: number;
      reason: string;
    }
  | {
      type: "api-optimization";
      currentTool: string;
      currentPlan: string;
      currentSpend: number;
      recommendation: string;
      monthlySavings: number;
      annualSavings: number;
      reason: string;
    };