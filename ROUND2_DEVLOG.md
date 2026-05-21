# Round 2 Devlog

## 2026-05-20 12:00 — Start
Received the assignment. Reading through the requirements and constraints. Will plan the architecture first.

## 2026-05-20 13:15 — Decided on approach
Choosing to reuse the existing `audits` table in Supabase to maintain URL parity and simplicity. Will use Resend for emails.

## 2026-05-20 16:30 — Database schema planned
Drafted the SQL to add JSONB columns (`input_stack`, `pricing_snapshot`) to `audits` rather than creating a whole new table.

## 2026-05-20 18:15 — Persistent audits working
Modified `/api/audit` to save the input stack and pricing snapshot instantly on generation.
*Slept 23:00 - 08:00*

## 2026-05-21 09:30 — Resuming work
Starting on the lead capture logic to link the generated audit ID to the user's email.

## 2026-05-21 11:45 — Lead capture linked
Updated `components/spend-form.tsx` and `/api/capture-lead`. The flow from audit creation to email capture is now fully connected in the DB.

## 2026-05-21 13:30 — Dynamic pricing refactor
Refactored `plan-efficiency.ts` and `tool-swap.ts` to use a dynamic `getPlanPrice` lookup instead of hardcoded numbers.

## 2026-05-21 15:00 — Detect changes endpoint built
Built the `POST /api/detect-changes` endpoint. It overrides pricing in-memory, queries Supabase, re-runs the deterministic engine, and calculates diffs.

## 2026-05-21 16:30 — Resend integrated
Integrated Resend into the detection endpoint. Drafted the HTML email. 

## 2026-05-21 17:45 — Diff view shipped
Built `/audit/[id]/rerun` for the side-by-side comparison. Relying on pre-calculated `new_output_result` to avoid re-rendering anomalies.

## 2026-05-21 18:30 — Final testing & Docs
Wrote the PR description and reflection. Manual testing passed. Ready for review.
