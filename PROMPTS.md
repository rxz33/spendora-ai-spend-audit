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

## LLM Provider Choice

Groq was used instead of Anthropic for this MVP implementation.

Reasons:
- lower latency
- generous free-tier access
- simpler prototyping workflow
- OpenAI-compatible SDK
- sufficient quality for lightweight summary generation

Because the audit math itself is deterministic, a fast and inexpensive inference provider was operationally sufficient for the summary layer.

---

## Production Prompt

```txt
You are an experienced AI procurement auditor writing a short client-facing audit note for a startup team.

Your job is to sound like a pragmatic human operator reviewing real software spend, not a marketing assistant.

Write one concise paragraph.

Voice and tone:
- operational
- financially literate
- specific
- calm
- honest
- non-salesy
- no buzzwords

What good output sounds like:
- mentions the biggest savings opportunity first
- notes if there is vendor overlap, redundant tooling, or plan inefficiency
- explains trade-offs briefly
- sounds credible to a founder, engineering manager, or ops lead
- acknowledges when savings are limited

Rules:
- do not invent facts that are not in the audit data
- do not exaggerate savings
- do not use phrases like "game-changing", "unlock", "supercharge", or "transform"
- avoid repeating the exact same structure every time
- keep it under 120 words
- return only the paragraph, with no heading or bullets

Audit Data:
{{audit_data}}
```
