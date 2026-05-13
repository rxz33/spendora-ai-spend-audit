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
 * Severity levels for audit findings
 */
export type SeverityLevel = "informational" | "low" | "medium" | "high" | "critical";

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
      severity: SeverityLevel;
      confidenceScore: number; // 0-100
      transparency: string;
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
      severity: SeverityLevel;
      confidenceScore: number; // 0-100
      transparency: string;
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
      severity: SeverityLevel;
      confidenceScore: number; // 0-100
      transparency: string;
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
      severity: SeverityLevel;
      confidenceScore: number; // 0-100
      transparency: string;
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
      severity: SeverityLevel;
      confidenceScore: number; // 0-100
      transparency: string;
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
      severity: SeverityLevel;
      confidenceScore: number; // 0-100
      transparency: string;
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
  
  // NEW: Nuanced health status
  healthStatus: "optimized" | "efficient" | "opportunities" | "inefficient" | "overspending";
  healthStatusLabel: string;
}