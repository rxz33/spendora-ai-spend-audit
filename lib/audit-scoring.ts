/**
 * Scoring utilities for audit recommendations
 * Provides standardized scoring logic for confidence, risk, and difficulty
 */

import {
  type ConfidenceLevel,
  type OperationalRisk,
  type MigrationDifficulty,
  type RecommendationPriority,
} from "@/types/audit";

/**
 * Score confidence based on data certainty
 *
 * High confidence:
 * - Unused seats (directly measurable)
 * - Oversized plans for team size (simple math)
 * - Orphaned accounts (direct observation)
 *
 * Medium confidence:
 * - Overlap detection (requires capability match)
 * - Workflow mismatch (observed from useCase)
 * - Utilization patterns (statistical)
 *
 * Low confidence:
 * - Tool switching (subjective productivity)
 * - Paid to free migration (productivity risk)
 * - API cost assumptions (usage volatility)
 */
export function scoreConfidence(
  findingType: string,
  strength: number = 0.5
): ConfidenceLevel {
  if (
    findingType === "unused-seats" ||
    findingType === "orphaned-account" ||
    findingType === "oversized-plan"
  ) {
    return "high";
  }

  if (
    findingType === "overlap-detection" ||
    findingType === "workflow-mismatch" ||
    findingType === "utilization-pattern"
  ) {
    return strength > 0.7 ? "medium" : "low";
  }

  return "low";
}

/**
 * Score operational risk based on workflow disruption
 *
 * Low risk:
 * - Seat management
 * - Billing optimization
 * - Non-critical tool removal
 *
 * Medium risk:
 * - Tool replacement within same category
 * - Plan downgrades that don't impact core workflow
 * - Consolidation with workaround options
 *
 * High risk:
 * - Entirely new workflow model (e.g., team API-first)
 * - Removing primary tool
 * - Forcing team migration mid-project
 */
export function scoreOperationalRisk(
  findingType: string,
  teamSize: number = 1
): OperationalRisk {
  if (
    findingType === "billing-optimization" ||
    findingType === "seat-removal" ||
    findingType === "annual-billing"
  ) {
    return "low";
  }

  if (
    findingType === "plan-downgrade" ||
    findingType === "tool-replacement" ||
    findingType === "overlap-consolidation"
  ) {
    return teamSize > 5 ? "medium" : "low";
  }

  if (findingType === "api-migration" || findingType === "workflow-overhaul") {
    return "high";
  }

  return "medium";
}

/**
 * Score migration difficulty based on implementation effort
 *
 * Easy:
 * - Billing changes
 * - Seat adjustments
 * - Free-tier trials (no data migration)
 *
 * Moderate:
 * - Tool replacement (same category)
 * - Plan downgrades
 * - Single-team consolidation
 *
 * Hard:
 * - Company-wide tool migration
 * - API-first workflow restructuring
 * - Removing tool with embedded workflows
 */
export function scoreMigrationDifficulty(
  findingType: string,
  teamSize: number = 1,
  isCompanyWide: boolean = false
): MigrationDifficulty {
  if (
    findingType === "billing-optimization" ||
    findingType === "seat-removal" ||
    findingType === "annual-billing"
  ) {
    return "easy";
  }

  if (
    findingType === "plan-downgrade" ||
    findingType === "tool-replacement" ||
    findingType === "overlap-consolidation"
  ) {
    if (teamSize > 10 || isCompanyWide) {
      return "hard";
    }
    return "moderate";
  }

  if (findingType === "api-migration") {
    return teamSize > 3 ? "hard" : "moderate";
  }

  return "moderate";
}

/**
 * Score recommendation priority
 *
 * Critical:
 * - Security issues
 * - Unused seats (easy savings, zero risk)
 * - Orphaned accounts
 *
 * Important:
 * - Significant overlaps
 * - Inefficient plans
 * - Workflow mismatches
 *
 * Optional:
 * - Tool switching (subjective)
 * - Billing optimization (secondary benefit)
 * - Free tier upgrades/downgrades
 */
export function scoreRecommendationPriority(
  findingType: string,
  monthlySavings: number = 0,
  risk: OperationalRisk = "medium"
): RecommendationPriority {
  // Unused seats and orphaned accounts are critical
  if (
    findingType === "unused-seats" ||
    findingType === "orphaned-account"
  ) {
    return "critical";
  }

  // High savings with low risk = important
  if (monthlySavings >= 20 && risk === "low") {
    return "important";
  }

  // Overlaps and workflow mismatches = important
  if (
    findingType === "overlap-consolidation" ||
    findingType === "workflow-mismatch"
  ) {
    return "important";
  }

  // Everything else is optional
  return "optional";
}

/**
 * Calculate utilization percentage (0-100)
 * Helps determine if tool is underutilized
 */
export function calculateUtilization(
  activeUsers: number,
  seats: number
): number {
  if (seats === 0) return 0;
  return Math.round((activeUsers / seats) * 100);
}

/**
 * Calculate fragmentation score (0-100)
 * Higher = more fragmented (worse)
 *
 * Factors:
 * - Number of tools
 * - Overlapping capabilities
 * - Spend distribution
 */
export function calculateFragmentationScore(
  toolCount: number,
  overlapCount: number,
  spendVariance: number
): number {
  // 0-20: focused (1-2 tools)
  // 20-40: organized (3-4 tools, clear separation)
  // 40-60: fragmented (5+ tools, some overlap)
  // 60-100: highly fragmented (many tools, significant overlap)

  let score = Math.min(toolCount * 12, 40); // Tool count contribution
  score += overlapCount * 15; // Overlap contribution
  score += Math.min(spendVariance * 10, 30); // Spend variance contribution

  return Math.min(score, 100);
}

/**
 * Calculate optimization score (0-100)
 * Higher = more room for optimization (worse efficiency)
 *
 * Based on:
 * - Utilization rates
 * - Overlap
 * - Pricing efficiency
 */
export function calculateOptimizationScore(
  overallUtilization: number,
  overlapPercentage: number,
  hasExpensivePlans: boolean
): number {
  let score = 0;

  // Low utilization = opportunity
  if (overallUtilization < 50) {
    score += 30;
  } else if (overallUtilization < 70) {
    score += 15;
  }

  // Overlap = opportunity
  score += overlapPercentage * 2;

  // Expensive plans = opportunity
  if (hasExpensivePlans) {
    score += 20;
  }

  return Math.min(score, 100);
}

/**
 * Realistic API cost estimation
 * Avoids unrealistic savings claims
 *
 * Uses conservative token assumptions:
 * - Claude API: $3-15 per 1M tokens
 * - OpenAI API: $0.15-0.60 per 1M tokens
 *
 * Typical usage ranges:
 * - Light: 10-20K tokens/month
 * - Medium: 50-100K tokens/month
 * - Heavy: 200-500K tokens/month
 */
export function estimateRealisticAPISpend(
  currentSubscriptionCost: number,
  estimatedUsageLevel: "light" | "medium" | "heavy" = "medium"
): {
  minMonthly: number;
  maxMonthly: number;
  reasoning: string;
} {
  const ranges: Record<string, { min: number; max: number }> = {
    light: { min: 5, max: 15 },
    medium: { min: 25, max: 60 },
    heavy: { min: 80, max: 200 },
  };

  const range = ranges[estimatedUsageLevel];

  return {
    minMonthly: range.min,
    maxMonthly: range.max,
    reasoning: `API costs depend heavily on usage patterns and token volume. Conservative estimates range $${range.min}–$${range.max}/month for ${estimatedUsageLevel} usage (10–500K tokens/month). Actual costs vary significantly based on workflow intensity.`,
  };
}
