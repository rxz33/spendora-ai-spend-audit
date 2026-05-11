/**
 * Confidence levels for audit recommendations
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Operational risk assessment
 */
export type OperationalRisk = "low" | "medium" | "high";

/**
 * Migration difficulty assessment
 */
export type MigrationDifficulty = "easy" | "moderate" | "hard";

/**
 * Recommendation priority
 */
export type RecommendationPriority = "critical" | "important" | "optional";

/**
 * Enhanced input to audit engine - supports both team-based and company-level insights
 * Maintains backward compatibility with existing teamSize usage
 */
export interface ToolSpend {
  tool: string;
  plan: string;
  monthlySpend: number;
  seats: number; // Total seats allocated
  teamSize: number; // Team members using this tool
  
  // NEW: Optional organization context
  activeUsers?: number; // How many actually use this tool
  companySize?: number; // Total company headcount
  department?: string; // Which department uses this
  
  useCase: string;
}

/**
 * Recommendation with full audit context
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
      confidence: ConfidenceLevel;
      operationalRisk: OperationalRisk;
      migrationDifficulty: MigrationDifficulty;
      priority: RecommendationPriority;
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
      confidence: ConfidenceLevel;
      operationalRisk: OperationalRisk;
      migrationDifficulty: MigrationDifficulty;
      priority: RecommendationPriority;
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
      confidence: ConfidenceLevel;
      operationalRisk: OperationalRisk;
      migrationDifficulty: MigrationDifficulty;
      priority: RecommendationPriority;
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
      confidence: ConfidenceLevel;
      operationalRisk: OperationalRisk;
      migrationDifficulty: MigrationDifficulty;
      priority: RecommendationPriority;
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
      confidence: ConfidenceLevel;
      operationalRisk: OperationalRisk;
      migrationDifficulty: MigrationDifficulty;
      priority: RecommendationPriority;
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
      confidence: ConfidenceLevel;
      operationalRisk: OperationalRisk;
      migrationDifficulty: MigrationDifficulty;
      priority: RecommendationPriority;
    };

/**
 * Stack-level audit insights
 * Aggregated analysis across all tools
 */
export interface StackAuditInsights {
  overallOptimizationScore: number; // 0-100
  fragmentationRisk: "low" | "medium" | "high";
  overlapSummary: string;
  benchmarkInsights: string[];
  totalPotentialMonthlySavings: number;
  totalPotentialAnnualSavings: number;
  criticalFindings: number;
  importantFindings: number;
  optionalFindings: number;
}