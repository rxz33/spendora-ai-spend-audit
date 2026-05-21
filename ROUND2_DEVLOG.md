# Round 2 Devlog

## 2026-05-20 12:00 — Start
Received the assignment. Reading through all requirements carefully before touching any code. The core ask: make audits persistent, detect pricing changes, email affected users, show a diff view. 4 features in 36 hours.

## 2026-05-20 13:15 — Decided on approach
Will reuse the existing `audits` table in Supabase — adding JSONB columns rather than creating new tables. This preserves URL parity with Round 1 share links. Resend for emails (free tier, simple API). Manual trigger endpoint instead of Vercel Cron (which requires Pro plan).

## 2026-05-20 14:00 — Schema design
Drafted the SQL: `user_email TEXT`, `input_stack JSONB`, `pricing_snapshot JSONB`, `new_output_result JSONB`, `new_pricing_snapshot JSONB`. No migrations framework — just raw ALTER TABLE statements documented in the PR.

## 2026-05-20 16:30 — Database columns live
Ran the ALTER TABLE statements against Supabase. Verified the columns exist and accept JSONB data correctly.

## 2026-05-20 18:15 — Persistent audit storage working
Modified `/api/audit` route to save `input_stack` and `pricing_snapshot` on every audit creation. Tested by running an audit and checking the row in Supabase — both JSONB columns populated correctly.

*Slept 23:00 – 08:00*

## 2026-05-21 09:30 — Resuming work
Starting on the lead capture integration. Need to link the user's email (from the "Stay Updated" form) to the already-created audit row.

## 2026-05-21 11:45 — Lead capture linked to audit ID
Updated `components/spend-form.tsx` to pass the `auditId` state to the lead capture flow. Modified `/api/capture-lead` to UPDATE the existing audit row with the user's email rather than creating a separate record. End-to-end flow: create audit → enter email → audit row now has both results and user_email.

## 2026-05-21 13:30 — Dynamic pricing refactor
This was the trickiest part. Refactored `plan-efficiency.ts` and `tool-swap.ts` to use a `getPlanPrice()` utility instead of hardcoded dollar values. Created the utility in `lib/utils.ts`. Had to be careful not to break the existing audit flow — ran several audits after the refactor to verify recommendations stayed identical.

## 2026-05-21 15:00 — Detect-changes endpoint built
Built `POST /api/detect-changes`. Accepts `{ tool, new_price }`, overrides pricing in-memory, fetches all audits from Supabase, re-runs `runAudit()` with the new pricing, and compares old vs new via JSON.stringify. Groups affected audits by user_email for consolidated notifications.

## 2026-05-21 16:30 — Resend email integration complete
Integrated Resend SDK. Wrote the HTML email template inline — includes the tool that changed, the new price, count of affected audits, and deep-links to the diff view for each one. Tested with my own email — received the notification within seconds.

## 2026-05-21 17:45 — Diff view shipped
Built `/audit/[id]/rerun` page. Fetches original `tools` and `new_output_result` from Supabase, renders them side-by-side with green/red highlighting. Added a headline showing the total savings delta. This took longer than expected — had to handle the case where `new_output_result` is null (audit hasn't been affected by any pricing change yet).

## 2026-05-21 18:30 — Documentation & PR description
Wrote `ROUND2_PR.md`, `ROUND2_DEVLOG.md`, and `ROUND2_REFLECTION.md`. Followed the exact format from the assignment. Committed all docs together.

## 2026-05-21 18:45 — CI fixes
Build failed on GitHub Actions due to strict ESLint rules — unused `AutoFitText` import in the rerun page, and two `any` types in the API routes. Fixed all three, build passes clean now.

## 2026-05-21 18:55 — Final bugfixes from code review
Caught three issues during final review: (1) `suggestedMonthlyCost` was evaluated at module-load time, not at re-run time — converted to ES6 getters so the dynamic pricing override actually propagates. (2) The detect-changes endpoint hardcoded "Pro"/"Individual" plan names — rewrote to update all paid plans dynamically. (3) `auditId` state wasn't cleared between consecutive audits — added `setAuditId(null)` reset. All fixed and pushed.
