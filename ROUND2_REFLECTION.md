# Round 2 Reflection

## 1. What was the most uncomfortable trade-off you made because of the time pressure?

Skipping authentication on the `/api/detect-changes` endpoint. This endpoint mutates pricing in memory, rewrites audit rows in Supabase, and triggers outbound emails to real users — it's effectively an admin-only operation exposed as a public POST. I knew this was architecturally wrong while writing it. The uncomfortable part wasn't the missing auth itself — it's that I shipped a working email blast trigger with zero access control because adding even a simple API key check would have meant also building a way to configure and rotate that key, which would have eaten 1–2 hours I needed for the diff view. I chose to protect the user-facing feature (the diff page) over the backend safety net, and documented the trade-off explicitly in the PR description so reviewers understand it was a deliberate choice, not an oversight.

## 2. If we extended the deadline by another 24 hours right now, what's the first thing you'd do?

Move pricing data from the in-memory array into a Supabase `pricing_versions` table with timestamps. Right now, the price override only lives for the duration of a single serverless invocation — if Vercel cold-starts a new instance, the override is gone. A database-backed pricing store would make the detection job idempotent and auditable: I could query "what was the price of Cursor Pro on May 15?" and diff against "what is it today?" without relying on ephemeral memory. This single change would also unlock the "pricing changelog" bonus feature almost for free, since every price update would already be versioned with a timestamp.

## 3. Looking back at your Round 1 codebase as a now-experienced user of it: what's one thing your Round 1 self made harder for your Round 2 self?

Hardcoding pricing directly into the audit rule files. In Round 1, `plan-efficiency.ts` had lines like `suggestedMonthlyCost: 20` baked into the rule objects. When Round 2 required dynamic pricing for re-audit comparisons, I had to refactor every rule to use a `getPlanPrice()` lookup function and then convert the static properties into ES6 getters so that prices are evaluated at call time instead of module-load time. If Round 1 had separated pricing data from rule logic from the start — even just by importing prices from a single `pricing.ts` file — the Round 2 refactor would have been a 10-minute change instead of a 90-minute one that touched 3 files and required careful testing to avoid breaking the original audit flow.
