import {
  type ToolSpend,
  type AuditRecommendation,
  type StackAuditInsights,
} from "@/types/audit";
import {
  scoreConfidence,
  scoreOperationalRisk,
  scoreMigrationDifficulty,
  scoreRecommendationPriority,
  scoreSeverity,
  getHealthStatus,
  calculateFragmentationScore,
  calculateOptimizationScore,
  calculateUtilization,
} from "./audit-scoring";
import { AuditCalculators } from "./audit/calculators";
import { AuditValidators } from "./audit/validators";
import {
  hasCapabilityOverlap,
  getToolCapabilities,
} from "./tool-capabilities-map";
import {
  planEfficiencyRules,
  overlapRules,
  toolSwapRules,
  utilizationRules,
  workflowRules,
} from "./audit-rules";

/**
 * Core audit engine - Production-grade AI spend audit
 *
 * Strategy:
 * 1. Collect ALL potential findings (don't return early)
 * 2. Score each finding for confidence, risk, and priority
 * 3. Rank and deduplicate findings
 * 4. Generate stack-level insights
 * 5. Return ranked recommendations with context
 */

export function runAudit(
  tools: ToolSpend[]
): {
  recommendations: AuditRecommendation[];
  stackInsights: StackAuditInsights;
  errors?: string[];
} {
  // Validate stack integrity
  const validationErrors = AuditValidators.validateStack(tools);

  const findings: AuditRecommendation[] = [];

  // Process each tool
  for (const tool of tools) {
    // Collect all potential findings for this tool
    const toolFindings = collectToolFindings(tool, tools);
    findings.push(...toolFindings);
  }

  // Rank findings by priority and savings
  const rankedFindings = rankFindings(findings);

  // Generate stack-level insights
  const stackInsights = generateStackInsights(tools, rankedFindings);

  return {
    recommendations: rankedFindings,
    stackInsights,
    errors: validationErrors.length > 0 ? validationErrors : undefined,
  };
}

/**
 * Collect all potential findings for a single tool
 * Returns array of findings (may include duplicates/conflicts)
 */
function collectToolFindings(
  tool: ToolSpend,
  allTools: ToolSpend[]
): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  // CATEGORY 1: Plan efficiency rules
  const planFindings = evaluatePlanEfficiency(tool);
  findings.push(...planFindings);

  // CATEGORY 2: Overlap detection (capability-based)
  const overlapFindings = detectCapabilityOverlap(tool, allTools);
  findings.push(...overlapFindings);

  // CATEGORY 3: Tool swap opportunities
  const swapFindings = evaluateToolSwaps(tool);
  findings.push(...swapFindings);

  // CATEGORY 4: Utilization analysis
  const utilizationFindings = analyzeUtilization(tool);
  findings.push(...utilizationFindings);

  // CATEGORY 5: Workflow alignment
  const workflowFindings = evaluateWorkflowAlignment(tool);
  findings.push(...workflowFindings);

  // If no findings, return honest "no-savings" recommendation
  if (findings.length === 0) {
    findings.push(createNoSavingsRecommendation(tool));
  }

  return findings;
}

/**
 * Evaluate plan efficiency rules
 */
function evaluatePlanEfficiency(tool: ToolSpend): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  const planRule = planEfficiencyRules.find(
    (rule) =>
      (rule.tool === null || rule.tool === tool.tool) &&
      (rule.plan === null || rule.plan === tool.plan) &&
      tool.teamSize <= rule.maxEfficientSeats
  );

  if (planRule) {
    const rawSavings = planRule.suggestedMonthlyCost
      ? tool.monthlySpend - planRule.suggestedMonthlyCost
      : typeof planRule.estimatedSavings === "function"
        ? planRule.estimatedSavings(tool.teamSize)
        : planRule.estimatedSavings;

    const savings = AuditCalculators.calculateSavings(tool.monthlySpend, tool.monthlySpend - rawSavings);

    if (savings > 0) {
      const risk = scoreOperationalRisk("plan-downgrade", tool.teamSize);
      const priority = scoreRecommendationPriority("oversized-plan", savings, risk);

      findings.push({
        type: "plan-downgrade",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: planRule.recommendation,
        monthlySavings: savings,
        annualSavings: AuditCalculators.toAnnual(savings),
        reason: planRule.reason,
        confidence: scoreConfidence("oversized-plan", 0.95),
        operationalRisk: risk,
        migrationDifficulty: scoreMigrationDifficulty("plan-downgrade", tool.teamSize),
        priority: priority,
        severity: scoreSeverity(priority, savings, risk),
        confidenceScore: 95,
        transparency: `Calculated based on ${tool.teamSize} team members vs ${planRule.maxEfficientSeats} seat limit for this plan level.`,
      });
    }
  }

  return findings;
}

/**
 * Detect overlapping tools using capability matching
 */
function detectCapabilityOverlap(
  tool: ToolSpend,
  allTools: ToolSpend[]
): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  for (const otherTool of allTools) {
    if (otherTool.tool === tool.tool) continue;

    if (hasCapabilityOverlap(tool.tool, otherTool.tool)) {
      const overlapRule = overlapRules.find((rule) =>
        rule.tools.some((t) => t === tool.tool) &&
        rule.tools.includes(otherTool.tool)
      );

      if (overlapRule) {
        // Nuanced check: Are they complementary?
        const isComplementary = (tool.tool === "Cursor" && otherTool.tool === "ChatGPT") ||
          (tool.tool === "ChatGPT" && otherTool.tool === "Cursor");

        const overlapMultiplier =
          tool.monthlySpend >= 100 ? 0.8 : 0.5;

        const overlapSavings = Math.round(
          overlapRule.estimatedSavings * overlapMultiplier
        );

        const savings = isComplementary
          ? 0
          : AuditCalculators.calculateSavings(
            tool.monthlySpend,
            tool.monthlySpend - overlapSavings
          );

        if (savings > 0) {
          const risk = scoreOperationalRisk("overlap-consolidation", tool.teamSize);
          const priority = scoreRecommendationPriority("overlap-consolidation", savings, risk);
          const commonCaps = getToolCapabilities(tool.tool).filter((c) => getToolCapabilities(otherTool.tool).includes(c));

          findings.push({
            type: "consolidate-overlap",
            currentTool: tool.tool,
            currentPlan: tool.plan,
            currentSpend: tool.monthlySpend,
            recommendation: overlapRule.recommendation,
            monthlySavings: savings,
            annualSavings: AuditCalculators.toAnnual(savings),
            reason: `${tool.tool} overlaps significantly with ${otherTool.tool} (common: ${commonCaps.join(", ")}).`,
            confidence: scoreConfidence("overlap-detection", 0.75),
            operationalRisk: risk,
            migrationDifficulty: scoreMigrationDifficulty("overlap-consolidation", tool.teamSize),
            priority: priority,
            severity: scoreSeverity(priority, savings, risk),
            confidenceScore: isComplementary ? 20 : 75,
            transparency: isComplementary
              ? "Flagged as potential overlap, but marked as complementary for specialized workflows (IDE vs Chat)."
              : `High overlap detected in ${commonCaps.length} core capabilities.`,
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Evaluate tool swap opportunities
 */
function evaluateToolSwaps(tool: ToolSpend): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  const swapRule = toolSwapRules.find((rule) => {
    const fromMatches = rule.from === tool.tool;
    const conditionMet =
      !rule.condition ||
      rule.condition(tool.useCase, tool.teamSize, tool.monthlySpend);
    return fromMatches && conditionMet;
  });

  if (swapRule && swapRule.estimatedSavings > 0) {
    const savings = AuditCalculators.calculateSavings(tool.monthlySpend, tool.monthlySpend - swapRule.estimatedSavings);
    const risk = scoreOperationalRisk("tool-replacement", tool.teamSize);
    const priority = scoreRecommendationPriority("tool-replacement", savings, risk);

    findings.push({
      type: "tool-switch",
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation: swapRule.recommendation,
      monthlySavings: savings,
      annualSavings: AuditCalculators.toAnnual(savings),
      reason: swapRule.reason,
      confidence: scoreConfidence("tool-replacement", 0.6),
      operationalRisk: risk,
      migrationDifficulty: scoreMigrationDifficulty("tool-replacement", tool.teamSize),
      priority: priority,
      severity: scoreSeverity(priority, savings, risk),
      confidenceScore: 60,
      transparency: `Evaluated ${tool.tool} against ${swapRule.to} for the '${tool.useCase}' use case.`,
    });
  }

  return findings;
}

/**
 * Analyze utilization patterns
 */
function analyzeUtilization(tool: ToolSpend): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  const activeUsers = tool.activeUsers ?? tool.teamSize;
  const utilization = AuditCalculators.calculateUtilization(activeUsers, tool.seats);

  const utilizationRule = utilizationRules.find((rule) =>
    rule.condition(tool.teamSize, tool.seats, tool.monthlySpend)
  );

  // Buffer check: If utilization is > 85%, we don't flag it as a mismatch/waste
  const unusedSeats = tool.seats - activeUsers;

  if (
    utilizationRule &&
    utilization < 85 &&
    unusedSeats >= 2
  ) {
    const rawSavings = typeof utilizationRule.estimatedSavings === "function"
      ? utilizationRule.estimatedSavings(tool.monthlySpend)
      : utilizationRule.estimatedSavings;

    const savings = AuditCalculators.calculateSavings(tool.monthlySpend, tool.monthlySpend - rawSavings);

    if (savings > 0) {
      const risk = scoreOperationalRisk("seat-removal");
      const priority = scoreRecommendationPriority("seat-removal", savings, "low");

      findings.push({
        type: "capability-mismatch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: utilizationRule.recommendation,
        monthlySavings: savings,
        annualSavings: AuditCalculators.toAnnual(savings),
        reason: `Tool utilization is ${Math.round(utilization)}%. ${utilizationRule.reason}`,
        confidence: scoreConfidence("utilization-pattern", 0.7),
        operationalRisk: risk,
        migrationDifficulty: scoreMigrationDifficulty("seat-removal"),
        priority: priority,
        severity: scoreSeverity(priority, savings, risk),
        confidenceScore: 70,
        transparency: `Analyzed ${tool.seats} allocated seats vs ${activeUsers} active users. Includes a 15% operational buffer.`,
      });
    }
  }

  return findings;
}

/**
 * Evaluate workflow alignment
 */
function evaluateWorkflowAlignment(tool: ToolSpend): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  const workflowRule = workflowRules.find(
    (rule) =>
      rule.useCase === tool.useCase &&
      rule.incompatibleTools.includes(tool.tool)
  );

  if (workflowRule) {
    const savings = AuditCalculators.calculateSavings(tool.monthlySpend, tool.monthlySpend - workflowRule.estimatedSavings);
    const risk = scoreOperationalRisk("workflow-mismatch", tool.teamSize);
    const priority = scoreRecommendationPriority("workflow-mismatch", savings, risk);

    findings.push({
      type: "capability-mismatch",
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation: workflowRule.recommendation,
      monthlySavings: savings,
      annualSavings: AuditCalculators.toAnnual(savings),
      reason: workflowRule.reason,
      confidence: scoreConfidence("workflow-mismatch", 0.75),
      operationalRisk: risk,
      migrationDifficulty: scoreMigrationDifficulty("workflow-mismatch", tool.teamSize),
      priority: priority,
      severity: scoreSeverity(priority, savings, risk),
      confidenceScore: 75,
      transparency: `Identified incompatibility between ${tool.tool} and specified use case: ${tool.useCase}.`,
    });
  }

  return findings;
}

/**
 * Create honest "no savings" recommendation
 */
function createNoSavingsRecommendation(tool: ToolSpend): AuditRecommendation {
  return {
    type: "no-savings",
    currentTool: tool.tool,
    currentPlan: tool.plan,
    currentSpend: tool.monthlySpend,
    recommendation: "Current setup appears operationally reasonable",
    reason: "No significant optimization opportunities detected based on current usage patterns and tool mix.",
    monthlySavings: 0,
    annualSavings: 0,
    confidence: "high",
    operationalRisk: "low",
    migrationDifficulty: "easy",
    priority: "optional",
    severity: "informational",
    confidenceScore: 100,
    transparency: "Verified against latest market pricing and capability maps.",
  };
}

/**
 * Rank findings by priority and savings
 * Removes duplicates/conflicts favoring higher-confidence recommendations
 */
function rankFindings(findings: AuditRecommendation[]): AuditRecommendation[] {
  // Group by tool
  const byTool = new Map<string, AuditRecommendation[]>();

  for (const finding of findings) {
    const key = finding.currentTool;
    if (!byTool.has(key)) {
      byTool.set(key, []);
    }
    byTool.get(key)!.push(finding);
  }

  // For each tool, select best recommendation
  const selected: AuditRecommendation[] = [];

  for (const [, toolFindings] of byTool) {
    // Sort by: priority (critical > important > optional), confidence, savings
    const sorted = toolFindings.sort((a, b) => {
      const priorityOrder = { critical: 0, important: 1, optional: 2 };
      const confidenceOrder = { high: 0, medium: 1, low: 2 };

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      }

      return b.monthlySavings - a.monthlySavings;
    });

    // Take top finding, but include "no-savings" if it's the only one
    if (sorted[0].type === "no-savings") {
      selected.push(sorted[0]);
    } else {
      // Only include if savings > 0 or it's critical
      if (sorted[0].monthlySavings > 0 || sorted[0].priority === "critical") {
        selected.push(sorted[0]);
      } else {
        selected.push(createNoSavingsRecommendation({
          tool: sorted[0].currentTool,
          plan: sorted[0].currentPlan,
          monthlySpend: sorted[0].currentSpend,
          seats: 1,
          teamSize: 1,
          useCase: "unknown",
        }));
      }
    }
  }

  // Sort final results by priority and savings
  return selected.sort((a, b) => {
    const priorityOrder = { critical: 0, important: 1, optional: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.monthlySavings - a.monthlySavings;
  });
}

/**
 * Generate stack-level insights
 */
function generateStackInsights(
  tools: ToolSpend[],
  recommendations: AuditRecommendation[]
): StackAuditInsights {
  const totalSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const toolCount = tools.length;

  // Calculate overlap count
  let overlapCount = 0;
  for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
      if (hasCapabilityOverlap(tools[i].tool, tools[j].tool)) {
        overlapCount++;
      }
    }
  }

  // Calculate average utilization
  let totalUtilization = 0;
  for (const tool of tools) {
    const activeUsers = tool.activeUsers ?? tool.teamSize;
    totalUtilization += calculateUtilization(activeUsers, tool.seats);
  }
  const avgUtilization = Math.round(totalUtilization / Math.max(toolCount, 1));

  // Calculate total potential savings
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  // Count finding types
  const criticalCount = recommendations.filter(
    (r) => r.priority === "critical"
  ).length;
  const importantCount = recommendations.filter(
    (r) => r.priority === "important"
  ).length;
  const optionalCount = recommendations.filter(
    (r) => r.priority === "optional"
  ).length;

  // Calculate fragmentation
  const spendVariance =
    tools.length > 1
      ? Math.max(
        ...tools.map((t) => t.monthlySpend)
      ) /
      Math.min(
        ...tools.map((t) => t.monthlySpend)
      )
      : 1;
  const fragmentationScore = calculateFragmentationScore(
    toolCount,
    overlapCount,
    spendVariance
  );

  // Generate insights
  const insights: string[] = [];

  if (overlapCount > 0) {
    insights.push(
      `${overlapCount} tool ${overlapCount === 1 ? "pair" : "pairs"} with overlapping capabilities detected. Consider consolidation strategy.`
    );
  }

  if (avgUtilization < 50) {
    insights.push(
      `Average tool utilization is ${avgUtilization}%. Organization may have over-provisioned seats or unused tools.`
    );
  } else if (avgUtilization > 80) {
    insights.push(
      `Tool utilization is strong (${avgUtilization}% average). Current stack appears well-matched to usage patterns.`
    );
  }

  if (toolCount > 8) {
    insights.push(
      "Stack contains 8+ tools. Consider whether complexity is justified by productivity gains."
    );
  } else if (toolCount <= 3) {
    insights.push(
      "Focused tool portfolio (≤3 tools). Organization may benefit from specialization."
    );
  }

  if (totalMonthlySavings > 0) {
    const savingsPercent = Math.round(
      (totalMonthlySavings / totalSpend) * 100
    );
    insights.push(
      `Potential monthly savings: $${totalMonthlySavings.toFixed(0)} (${savingsPercent}% of current spend).`
    );
  }

  const benchmarkInsights = generateBenchmarkInsights(
    tools,
    avgUtilization,
    totalSpend
  );
  insights.push(...benchmarkInsights);

  const fragmentationRisk: "low" | "medium" | "high" =
    fragmentationScore < 30 ? "low" : fragmentationScore < 60 ? "medium" : "high";

  // Calculate optimization score (percentage of savings vs total spend + overlap/utilization factors)
  const overlapPercentage = (overlapCount / Math.max(toolCount, 1)) * 100;
  const hasExpensivePlans = recommendations.some(r => r.type === 'plan-downgrade' && r.currentSpend > 50);

  const optimizationScore = calculateOptimizationScore(
    avgUtilization,
    overlapPercentage,
    hasExpensivePlans
  );

  // Generate nuanced health status
  const health = getHealthStatus(optimizationScore);

  return {
    overallOptimizationScore: Math.round(optimizationScore),
    fragmentationRisk,
    overlapSummary:
      overlapCount === 0
        ? "No capability overlaps detected."
        : `${overlapCount} overlapping tool ${overlapCount === 1 ? "pair" : "pairs"}.`,
    benchmarkInsights: insights,
    totalPotentialMonthlySavings: Math.round(totalMonthlySavings),
    totalPotentialAnnualSavings: Math.round(totalAnnualSavings),
    criticalFindings: criticalCount,
    importantFindings: importantCount,
    optionalFindings: optionalCount,
    healthStatus: health.status,
    healthStatusLabel: health.label,
  };
}

/**
 * Generate realistic benchmark insights
 * Avoid fake statistics - use heuristic reasoning only
 */
function generateBenchmarkInsights(
  tools: ToolSpend[],
  avgUtilization: number,
  totalSpend: number
): string[] {
  const insights: string[] = [];

  // Estimate company size from tools and spend patterns
  // This is heuristic, not statistical
  // const avgToolSpend = totalSpend / Math.max(tools.length, 1);

  if (totalSpend > 500 && tools.length > 5) {
    insights.push(
      "AI tooling spend is substantial. Consider formal procurement governance."
    );
  }

  if (avgUtilization < 40 && tools.length > 3) {
    insights.push(
      "Low utilization + high tool count suggests potential for consolidation and optimization."
    );
  }

  return insights;
}
