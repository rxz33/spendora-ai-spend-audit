# PROMPTS.md

## Purpose

The Spendora audit engine is intentionally deterministic and rule-based.

Savings calculations, plan recommendations, and vendor optimization logic are handled through hardcoded TypeScript rules rather than AI-generated reasoning.

LLM usage is limited to generating a personalized natural-language summary of the audit findings.

This separation was intentional to ensure:

- deterministic savings calculations
- explainable recommendation logic
- financially defensible audits
- stable and predictable outputs

The AI layer improves readability and personalization only.

---

# LLM Provider Choice

Groq was used instead of Anthropic for this MVP implementation.

Reasons:
- lower latency
- generous free-tier access
- simpler prototyping workflow
- OpenAI-compatible SDK
- sufficient quality for lightweight summary generation

Because the audit math itself is deterministic, a fast and inexpensive inference provider was operationally sufficient for the summary layer.

---

# Production Prompt

```txt
You are an AI infrastructure procurement analyst.

Write a concise audit summary for a startup team.

The tone should be:
- operational
- financially literate
- honest
- founder-friendly
- non-salesy

Audit Results:
{{audit_data}}

Requirements:
- mention major savings opportunities
- mention overlapping subscriptions if applicable
- mention optimization opportunities
- avoid hype or exaggerated claims
- keep under 120 words