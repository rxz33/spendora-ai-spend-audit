import { ToolSpend } from "@/types/audit";

/**
 * Validates user input before it reaches the audit engine.
 */
export const AuditValidators = {
  /**
   * Basic integrity check for tool spend data.
   */
  validateToolSpend: (tool: ToolSpend): string[] => {
    const errors: string[] = [];

    if (!tool.tool) errors.push("Tool name is required");
    if (tool.monthlySpend < 0) errors.push(`Monthly spend for ${tool.tool || 'tool'} cannot be negative`);
    if (tool.seats < 0) errors.push(`Seats for ${tool.tool || 'tool'} cannot be negative`);
    if (tool.teamSize < 0) errors.push(`Team size for ${tool.tool || 'tool'} cannot be negative`);
    
    // Check for obvious data entry errors
    if (tool.monthlySpend > 50000) {
      errors.push(`Monthly spend for ${tool.tool} ($${tool.monthlySpend}) seems unusually high. Please verify.`);
    }

    return errors;
  },

  /**
   * Validates the entire stack.
   */
  validateStack: (tools: ToolSpend[]): string[] => {
    if (tools.length === 0) return ["At least one tool is required for an audit."];
    
    const allErrors = tools.flatMap(t => AuditValidators.validateToolSpend(t));
    return allErrors;
  }
};
