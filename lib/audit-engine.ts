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
  calculateUtilization,
  calculateFragmentationScore,
  calculateOptimizationScore,
} from "./audit-scoring";
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
} {
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
    const savings = planRule.suggestedMonthlyCost
      ? tool.monthlySpend - planRule.suggestedMonthlyCost
      : typeof planRule.estimatedSavings === "function"
        ? planRule.estimatedSavings(tool.teamSize)
        : planRule.estimatedSavings;

    if (savings > 0) {
      findings.push({
        type: "plan-downgrade",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: planRule.recommendation,
        monthlySavings: Math.max(savings, 0),
        annualSavings: Math.max(savings, 0) * 12,
        reason: planRule.reason,
        confidence: scoreConfidence("oversized-plan", 0.95),
        operationalRisk: scoreOperationalRisk("plan-downgrade", tool.teamSize),
        migrationDifficulty: scoreMigrationDifficulty(
          "plan-downgrade",
          tool.teamSize
        ),
        priority: scoreRecommendationPriority(
          "oversized-plan",
          Math.max(savings, 0),
          scoreOperationalRisk("plan-downgrade", tool.teamSize)
        ),
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

  // Find tools with overlapping capabilities
  for (const otherTool of allTools) {
    if (otherTool.tool === tool.tool) continue; // Skip self

    if (hasCapabilityOverlap(tool.tool, otherTool.tool)) {
      const overlapRule = overlapRules.find((rule) =>
        rule.tools.some((t) => t === tool.tool) &&
        rule.tools.includes(otherTool.tool)
      );

      if (overlapRule && Math.abs(tool.monthlySpend - otherTool.monthlySpend) < 100) {
        findings.push({
          type: "consolidate-overlap",
          currentTool: tool.tool,
          currentPlan: tool.plan,
          currentSpend: tool.monthlySpend,
          recommendation: overlapRule.recommendation,
          monthlySavings: overlapRule.estimatedSavings,
          annualSavings: overlapRule.estimatedSavings * 12,
          reason: `${tool.tool} overlaps significantly with ${otherTool.tool} (both support ${getToolCapabilities(tool.tool).filter((c) => getToolCapabilities(otherTool.tool).includes(c)).join(", ")}). Consider consolidating to eliminate redundancy.`,
          confidence: scoreConfidence("overlap-detection", 0.75),
          operationalRisk: scoreOperationalRisk("overlap-consolidation", tool.teamSize),
          migrationDifficulty: scoreMigrationDifficulty(
            "overlap-consolidation",
            tool.teamSize
          ),
          priority: scoreRecommendationPriority(
            "overlap-consolidation",
            overlapRule.estimatedSavings,
            scoreOperationalRisk("overlap-consolidation", tool.teamSize)
          ),
        });
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
    findings.push({
      type: "tool-switch",
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation: swapRule.recommendation,
      monthlySavings: swapRule.estimatedSavings,
      annualSavings: swapRule.estimatedSavings * 12,
      reason: swapRule.reason,
      confidence: scoreConfidence("tool-replacement", 0.6),
      operationalRisk: scoreOperationalRisk("tool-replacement", tool.teamSize),
      migrationDifficulty: scoreMigrationDifficulty(
        "tool-replacement",
        tool.teamSize
      ),
      priority: scoreRecommendationPriority(
        "tool-replacement",
        swapRule.estimatedSavings,
        scoreOperationalRisk("tool-replacement", tool.teamSize)
      ),
    });
  }

  return findings;
}

/**
 * Analyze utilization patterns
 */
function analyzeUtilization(tool: ToolSpend): AuditRecommendation[] {
  const findings: AuditRecommendation[] = [];

  // Use activeUsers if available, otherwise use teamSize
  const activeUsers = tool.activeUsers ?? tool.teamSize;
  const utilization = calculateUtilization(activeUsers, tool.seats);

  const utilizationRule = utilizationRules.find((rule) =>
    rule.condition(tool.teamSize, tool.seats, tool.monthlySpend)
  );

  if (utilizationRule) {
    const savings =
      typeof utilizationRule.estimatedSavings === "function"
        ? utilizationRule.estimatedSavings(tool.monthlySpend)
        : utilizationRule.estimatedSavings;

    if (savings > 0) {
      findings.push({
        type: "capability-mismatch",
        currentTool: tool.tool,
        currentPlan: tool.plan,
        currentSpend: tool.monthlySpend,
        recommendation: utilizationRule.recommendation,
        monthlySavings: Math.max(savings, 0),
        annualSavings: Math.max(savings, 0) * 12,
        reason: `Tool utilization is ${utilization}%. ${utilizationRule.reason}`,
        confidence: scoreConfidence("utilization-pattern", 0.7),
        operationalRisk: scoreOperationalRisk("seat-removal"),
        migrationDifficulty: scoreMigrationDifficulty("seat-removal"),
        priority: scoreRecommendationPriority(
          "seat-removal",
          Math.max(savings, 0),
          "low"
        ),
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
    findings.push({
      type: "capability-mismatch",
      currentTool: tool.tool,
      currentPlan: tool.plan,
      currentSpend: tool.monthlySpend,
      recommendation: workflowRule.recommendation,
      monthlySavings: workflowRule.estimatedSavings,
      annualSavings: workflowRule.estimatedSavings * 12,
      reason: workflowRule.reason,
      confidence: scoreConfidence("workflow-mismatch", 0.75),
      operationalRisk: scoreOperationalRisk("workflow-mismatch", tool.teamSize),
      migrationDifficulty: scoreMigrationDifficulty(
        "workflow-mismatch",
        tool.teamSize
      ),
      priority: scoreRecommendationPriority(
        "workflow-mismatch",
        workflowRule.estimatedSavings,
        scoreOperationalRisk("workflow-mismatch", tool.teamSize)
      ),
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

  const optimizationScore = calculateOptimizationScore(
    avgUtilization,
    (overlapCount / Math.max(toolCount * (toolCount - 1) / 2, 1)) * 100,
    tools.some((t) => t.monthlySpend > 50)
  );

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
