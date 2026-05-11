/**
 * Type definitions for audit rules
 */

export type PlanEfficiencyRule = {
  id: string;
  tool: string | null;
  plan?: string | null;
  maxEfficientSeats: number;
  recommendation: string;
  reason: string;
  suggestedMonthlyCost?: number;
  estimatedSavings: number | ((teamSize: number) => number);
};

export type OverlapRule = {
  id: string;
  tools: string[];
  recommendation: string;
  reason: string;
  estimatedSavings: number;
};

export type ToolSwapRule = {
  id: string;
  from: string;
  to: string;
  fromPrice: number;
  toPrice: number;
  recommendation: string;
  reason: string;
  estimatedSavings: number;
  condition?: (useCase: string, teamSize: number, monthlySpend: number) => boolean;
};

export type UtilizationRule = {
  id: string;
  recommendation: string;
  reason: string;
  estimatedSavings: number | ((monthlySpend: number) => number);
  condition: (teamSize: number, seats: number, monthlySpend: number) => boolean;
};

export type WorkflowRule = {
  id: string;
  useCase: string;
  incompatibleTools: string[];
  recommendation: string;
  reason: string;
  estimatedSavings: number;
};

export type PaymentRule = {
  id: string;
  recommendation: string;
  reason: string;
  estimatedSavings: number | ((monthlySpend: number) => number);
  condition?: (teamSize: number) => boolean;
};

export type StrategyRule = {
  id: string;
  tool: string | null;
  recommendation: string;
  reason: string;
  estimatedSavings: number | ((monthlySpend: number) => number);
  condition: (monthlySpend: number, teamSize: number) => boolean;
};
