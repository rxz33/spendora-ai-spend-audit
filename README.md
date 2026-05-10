# Spendora — AI Spend Audit

## Live Demo

https://spendora-ai-spend-audit.vercel.app/

---

## Product Overview

Spendora is an AI spend auditing tool that helps teams analyze subscriptions across AI vendors, identify redundant tooling, and estimate potential monthly savings.

The product uses deterministic TypeScript audit rules to generate explainable optimization recommendations instead of relying entirely on AI-generated outputs.

Pricing references and vendor research are documented in `PRICING_DATA.md`.

---

## Features

- Multi-tool AI spend input form
- Structured vendor and plan selection
- Deterministic audit engine
- Savings opportunity analysis
- Executive summary generation
- Honest “already optimized” recommendation state
- Credex CTA for high-savings accounts
- Local persistence using localStorage
- Automated testing with Vitest
- GitHub Actions CI pipeline
- Husky pre-commit quality checks

## Audit Logic

The recommendation engine intentionally uses deterministic TypeScript rules for the first version of the product.

Current optimization heuristics include:
- identifying inefficient team plans
- detecting overlapping AI chat subscriptions
- suggesting lower-cost alternatives
- highlighting redundant tooling
- calculating estimated monthly and annual savings

This approach improves:
- explainability
- testing reliability
- consistency of recommendations
- pricing normalization

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

### Testing
- Vitest

### Infrastructure
- Vercel
- GitHub Actions
- Husky

## Architecture

See:
- ARCHITECTURE.md

## Running Locally

```bash
git clone <repo-url>

cd spendora-ai-spend-audit

npm install

npm run dev
```

## Running Tests

```bash
npm run test
```

## Deployment

The application is deployed on Vercel with automated CI checks using GitHub Actions.

---

## Key Decisions & Trade-offs

### 1. **Deterministic Rules Over AI for Audit Logic**
**Decision:** Audit recommendations use hardcoded TypeScript rules, not LLM outputs.

**Why:** The assignment explicitly stated knowing *when not to use AI* is part of the evaluation. Deterministic logic is testable, explainable, and financially defensible. Users can trace exactly why they got a recommendation.

**Trade-off:** Less flexible for edge cases, but more honest and consistent.

---

### 2. **localStorage Over Backend Database for Form Persistence**
**Decision:** Form state persists locally in browser storage, not in a database.

**Why:** Lower operational complexity, instant load, works offline. For a lead-gen tool where we capture emails *after* value is shown, we don't need to sync form state server-side until commitment.

**Trade-off:** Users can't sync across devices. But the flow is: form → audit → email capture (at which point we have the data). This fits the product model.

---

### 3. **Groq API Over Anthropic for Summaries**
**Decision:** AI summaries use Groq's llama-3.3-70b instead of Claude API.

**Why:** Faster inference, generous free tier, sufficient quality for non-critical summaries. Since audit math is deterministic, we don't need the most sophisticated reasoning.

**Trade-off:** Groq has lower brand recognition than Anthropic. But operationally it works and costs less.

---

### 4. **Next.js App Router Over Pages Router**
**Decision:** Built on App Router (the newer Next.js pattern).

**Why:** Better for server/client separation, cleaner API route structure, native support for dynamic routes (`/audit/[id]`).

**Trade-off:** Newer ecosystem, fewer StackOverflow answers. But this is a simple CRUD app, so modern conventions actually help.

---

### 5. **Honest "Already Optimized" UX Over Fake Savings**
**Decision:** If a team is spending <$100/month or already on optimal plans, we say so instead of manufacturing savings.

**Why:** Assignment emphasized entrepreneurial thinking = building trust. Fake savings destroy credibility. Long-term, honest audits → better Credex conversions.

**Trade-off:** Lower conversion rate on this segment. But higher trust and better product positioning.

---

## Future Improvements

- Shareable audit URLs with OG/Twitter Card metadata
- Organization-wide spend aggregation
- Vendor overlap detection using embeddings
- Usage-based pricing normalization for APIs
- CRM integration for enterprise lead routing
- PDF export of audit reports
- Benchmark mode ("your spend vs. average for your team size")