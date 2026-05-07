export interface ToolSpend {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  useCase: string;
}

export interface AuditRecommendation {
  currentTool: string;
  suggestedTool: string;
  estimatedSavings: number;
  annualSavings: number;
  reason: string;
}