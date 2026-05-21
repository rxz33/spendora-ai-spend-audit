# Round 2: Re-Audit on Pricing Change 

## What changed?
Implemented the "Re-audit on Pricing Change" feature under extreme time constraints while maintaining the existing elegant UI and Supabase architecture.

### Features Included:
1. **Persistent Audits:** Hooked into `SpendForm` to save `input_stack` and `pricing_snapshot` immediately. Updated lead capture to link `user_email` to the existing audit ID. Zero new database tables—just added 4 columns to the existing `audits` table.
2. **Dynamic Pricing Rules:** Refactored `plan-efficiency.ts` and `tool-swap.ts` to dynamically lookup prices via a new `getPlanPrice` utility.
3. **Change Detector Endpoint (`POST /api/detect-changes`):** Simulates an admin updating a price, automatically fetches all stored audits, re-runs the `runAudit` engine using the live overridden price, and uses simple object comparison (`JSON.stringify`) to find affected audits.
4. **Resend Email Notifications:** Dispatches a clean HTML email to users with affected audits highlighting what changed and providing a quick link to the diff.
5. **Diff View (`/audit/[id]/rerun`):** A side-by-side comparison page visually highlighting changes in recommendations and the headline savings delta.

### What I cut (Trade-offs for speed):
- **Dashboard/UI for Admin Pricing Updates:** Instead of a complex UI, pricing changes are triggered via a simple POST payload to the detection endpoint.
- **Batched Emails & Queues:** Processed synchronously in the API route. Perfect for demo scale; would need an async queue (e.g., Inngest) for production.
- **Unsubscribe System:** Skipped the complex opt-out flow to ensure the core requirement was shipped immaculately.

### How to Test:
1. Run this SQL in Supabase:
   ```sql
   ALTER TABLE audits ADD COLUMN IF NOT EXISTS user_email TEXT;
   ALTER TABLE audits ADD COLUMN IF NOT EXISTS input_stack JSONB;
   ALTER TABLE audits ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB;
   ALTER TABLE audits ADD COLUMN IF NOT EXISTS new_output_result JSONB;
   ALTER TABLE audits ADD COLUMN IF NOT EXISTS new_pricing_snapshot JSONB;
   ```
2. Create an audit on the homepage with `Cursor Pro` ($20).
3. Enter your email in the "Stay Updated" form to link your email to the audit.
4. Hit `POST /api/detect-changes` with body `{"tool":"Cursor", "newPrice":30}`.
5. Check your email for the Resend notification.
6. Click the link in the email to view the beautiful side-by-side diff!
