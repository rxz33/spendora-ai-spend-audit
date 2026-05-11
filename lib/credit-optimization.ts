export const creditOptimizations = [
  {
    sourceTool: "ChatGPT",

    useCase: "coding",

    recommendation:
      "Consider OpenAI API for engineering workloads (estimated $0.03–$0.07/developer/month vs $20/month Plus).",

    reason:
      "API token pricing ($0.15/$0.60 per 1M in/out tokens) is significantly cheaper than ChatGPT Plus ($20/month) for typical coding workflows using <100K tokens/month. For a team of 8 developers, this represents potential savings of $160–$180/month ($1,920–$2,160/year). Reference: see PRICING_DATA.md for token estimates and breakeven analysis.",
  },

  {
    sourceTool: "Claude",

    useCase: "writing",

    recommendation:
      "Evaluate Anthropic API for document workflows (estimated $0.30–$0.75/user/month vs $20/month Pro).",

    reason:
      "API token pricing ($3/$15 per 1M in/out tokens) is substantially cheaper than Claude Pro ($20/month) for content-heavy, asynchronous workflows. A 5-person writing team paying $100/month (5 × $20) could reduce to ~$1.50/month via API. Annual savings: ~$1,182. See PRICING_DATA.md for usage estimates and token cost breakdown.",
  },

  {
    sourceTool: "Claude",

    useCase: "coding",

    recommendation:
      "Evaluate Anthropic API for intermittent coding support (estimated $0.30–$0.75/developer/month vs $20/month Pro).",

    reason:
      "For teams using Claude occasionally for code review or documentation generation, API pricing ($3/$15 per 1M tokens) is substantially cheaper than fixed retail subscriptions. Reference: PRICING_DATA.md token estimates.",
  },

  {
    sourceTool: "ChatGPT",

    useCase: "writing",

    recommendation:
      "Consider OpenAI API for content generation workflows (estimated $0.03–$0.07/user/month vs $20/month Plus).",

    reason:
      "API token pricing is significantly cheaper for teams with predictable, moderate token usage patterns. A marketing or content team of 5 users could save $99+/month. See PRICING_DATA.md for detailed token cost analysis.",
  },
];