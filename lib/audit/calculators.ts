import { ToolSpend, AuditRecommendation } from "@/types/audit";

/**
 * Standardizes calculation logic to ensure mathematical consistency across the app.
 */
export const AuditCalculators = {
  /**
   * Safely calculate savings, ensuring they never exceed the current spend.
   */
  calculateSavings: (currentSpend: number, suggestedSpend: number): number => {
    const savings = Math.max(0, currentSpend - suggestedSpend);
    return Math.min(savings, currentSpend);
  },

  /**
   * Project annual savings from monthly savings.
   */
  toAnnual: (monthly: number): number => monthly * 12,

  /**
   * Determine seat utilization with a 15% 'hiring/onboarding buffer'.
   */
  calculateUtilization: (activeUsers: number, totalSeats: number): number => {
    if (totalSeats === 0) return 0;
    // We allow up to 115% "perceived" utilization to account for buffer
    const bufferMultiplier = 1.15;
    const utilization = (activeUsers / totalSeats);
    return Math.min(100, (utilization / bufferMultiplier) * 100);
  },

  /**
   * Calculate a confidence score based on evidence and risk.
   */
  calculateConfidence: (evidenceLevel: number, riskLevel: number): number => {
    // scale of 0-100
    // evidence 0-10, risk 0-10
    const score = (evidenceLevel * 10) - (riskLevel * 5);
    return Math.max(0, Math.min(100, score));
  }
};
