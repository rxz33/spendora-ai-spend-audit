# feat: add re-audit on pricing change with email notifications

## What this PR does

Adds a complete "Re-audit on Pricing Change" pipeline to Spendora. When AI tool pricing changes, stored audits are automatically re-evaluated against the new prices, affected users receive a consolidated email notification via Resend, and a one-click link takes them to a side-by-side diff view comparing their original audit recommendations against the updated ones.

## Why

A one-time audit becomes stale the moment pricing shifts — Cursor raised prices in 2024, Claude added tiers in 2025. Users who made decisions based on old recommendations deserve to know when those recommendations change. This feature turns Spendora from a snapshot tool into a living advisor, which is the core value proposition for retention and trust.

## How it works

**Data flow:**

1. **Audit creation** (`/api/audit`) — Every audit now persists `input_stack` (the user's tool configuration), `pricing_snapshot` (prices at audit time), and links to `user_email` via the lead capture form. No new tables — 4 JSONB columns added to the existing `audits` table.

2. **Pricing change detection** (`POST /api/detect-changes`) — Accepts `{ tool, new_price }` (or `{ tool, newPrice, planName }`). Overrides the in-memory pricing array, fetches all stored audits from Supabase, re-runs `runAudit()` against the updated prices, and compares old vs new recommendations via `JSON.stringify`.

3. **Email dispatch** — Affected audits are grouped by `user_email`. One consolidated HTML email per user is sent via Resend, listing all impacted audits with deep-links to the diff view.

4. **Diff view** (`/audit/[id]/rerun`) — Fetches the original `tools` and `new_output_result` from the database and renders them side-by-side with green/red visual highlighting and a headline savings delta.

**Key architectural choice:** Pricing rules in `plan-efficiency.ts` and `tool-swap.ts` use ES6 getters (`get suggestedMonthlyCost()`) so that `getPlanPrice()` is evaluated at call time, not module-load time. This ensures the in-memory price override propagates correctly through the deterministic engine during re-runs.

## What I cut

- **Admin UI for pricing updates** — Instead of a CRUD dashboard, pricing changes are triggered via a POST payload to the detection endpoint. Value/effort ratio was clear: the reviewer can test with a single curl command.
- **Async email queue** — Emails are sent synchronously in the API route. Perfect for demo scale (~100 audits); would need Inngest or SQS for production with 10k+ users.
- **Unsubscribe system** — Skipped the opt-out flow to protect time for the diff view, which is the core UX deliverable.
- **Scheduled cron trigger** — Chose a manual `/api/detect-changes` endpoint over Vercel Cron (requires Pro plan) or GitHub Actions schedule. Documented this trade-off explicitly.
- **Automated tests** — Prioritised shipping all 4 required features end-to-end over writing test files. See "What's tested" below.

## How to test it manually

1. Go to the live deployment and submit an audit with **Cursor Pro** at **$20/month**, team size 2.
2. Enter your email in the "Stay Updated" lead capture form — this links your email to the audit.
3. Trigger a pricing change:
   ```bash
   curl -X POST https://spendora-ai-spend-audit-amn5plxkt.vercel.app/api/detect-changes \
     -H "Content-Type: application/json" \
     -d '{"tool": "cursor", "new_price": 30}'
   ```
4. Check your inbox for a Resend email from `Spendora <onboarding@resend.dev>`.
5. Click the "View Diff" link in the email.
6. You should see a side-by-side comparison with the old recommendation (based on $20) vs the new recommendation (based on $30), with visual highlighting and a savings delta headline.

## What's tested

- **Manual end-to-end testing:** Full flow from audit creation → email capture → pricing change trigger → email received → diff view rendered. Verified across Cursor, ChatGPT, and Claude pricing changes.
- **Build verification:** `next build` passes with zero TypeScript errors and zero ESLint warnings. GitHub Actions CI workflow runs on every push.
- **No automated unit/integration tests in this PR.** Given the 36-hour constraint, I prioritised shipping all 4 required features over writing test files. If I had 4 more hours, I'd add: (1) a test for `runAudit()` determinism with mocked pricing, (2) a test for the `/api/detect-changes` endpoint ensuring only changed audits are flagged, (3) a snapshot test for the diff view component.

## Open questions / risks

- **In-memory pricing override is ephemeral.** The price mutation lives only for the duration of that single serverless invocation. If Vercel cold-starts a new instance between the override and the audit re-run, the override is lost. For production, pricing should be stored in the database.
- **No auth gate on `/api/detect-changes`.** Any caller can trigger bulk re-runs and email sends. Production would need an API key or admin session check. Cut deliberately for demo simplicity.
- **Email deliverability on Resend free tier.** Emails are sent from `onboarding@resend.dev` (Resend's shared domain). Some corporate inboxes may filter these. A custom domain would fix this but requires DNS setup outside the 36-hour window.
