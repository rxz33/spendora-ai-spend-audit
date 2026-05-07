# Pricing Data

Last verified: May 2026

## Vendor Pricing Research

| Tool | Plan | Monthly Cost | Billing Type | Notes | Source |
|------|------|------|------|------|------|
| Cursor | Pro | $20/mo | Per user | AI-first coding IDE | https://cursor.com/pricing |
| Cursor | Teams | $40/mo | Per seat | Team collaboration + admin controls | https://cursor.com/pricing |
| GitHub Copilot | Pro | $10/mo | Per user | AI coding assistant for developers | https://github.com/features/copilot/plans |
| GitHub Copilot | Business | $19/mo | Per user | Team and organization features | https://github.com/features/copilot/plans |
| ChatGPT | Plus | $20/mo | Per user | GPT-4 access with tools | https://openai.com/chatgpt/pricing |
| ChatGPT | Team | $30/mo | Per user | Shared workspace and admin features | https://openai.com/chatgpt/pricing |
| Claude | Pro | $20/mo | Per user | Anthropic premium AI assistant | https://www.anthropic.com/pricing |
| Claude | Team | $30/mo | Per user | Team collaboration and shared usage | https://www.anthropic.com/pricing |
| Gemini | Advanced | $19.99/mo | Per user | Google AI premium subscription | https://gemini.google/subscriptions |
| Perplexity | Pro | $17/mo | Per user | AI search and research assistant | https://www.perplexity.ai/pro |
| Midjourney | Basic | $10/mo | Per user | AI image generation plan | https://docs.midjourney.com/docs/plans |
| Midjourney | Standard | $30/mo | Per user | Higher GPU limits and relaxed mode | https://docs.midjourney.com/docs/plans |
| Replit | Core | $18/mo | Per user | Cloud coding workspace with AI | https://replit.com/pricing |
| Replit | Pro | $90/mo | Per user | Commercial and professional builds | https://replit.com/pricing |
| Bolt.new | Pro | $25/mo | Per user | AI full-stack application builder | https://bolt.new/pricing |
| Bolt.new | Teams | $30/mo | Per member | Team collaboration and centralized billing | https://bolt.new/pricing |

---

## Research Notes

- Most premium AI productivity tools converge around the $20/month pricing tier.
- Developer-focused tools like GitHub Copilot remain among the lowest-cost paid AI subscriptions.
- Pricing models vary between:
  - per-user subscriptions
  - per-seat team billing
  - usage-based credits
  - enterprise custom pricing
- Several vendors incentivize annual billing with discounts between 10%–30%.
- Enterprise pricing is generally custom and excluded from this MVP dataset.
- This dataset is intended for deterministic audit logic and recommendation generation, not real-time billing accuracy.

---

## Planned Audit Logic Usage

This pricing dataset will power:

- plan-fit recommendations
- cheaper same-vendor suggestions
- cross-tool savings comparisons
- seat-count optimization checks
- team-plan downgrade detection
- monthly and annual savings calculations

Example:

- Recommend GitHub Copilot Pro instead of Cursor Teams for small engineering teams
- Detect overpayment on team plans with low seat counts
- Suggest switching from multiple overlapping AI subscriptions to consolidated tooling