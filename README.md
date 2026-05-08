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

## Future Improvements

- shareable audit reports
- AI-generated optimization summaries
- organization-wide spend tracking
- usage-based pricing normalization
- vendor overlap detection
- CRM integrations