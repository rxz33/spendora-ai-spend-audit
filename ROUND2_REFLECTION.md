# Round 2 Reflection

## Trade-offs and Pragmatic Decisions

Building an entire re-audit and notification engine in a short window requires extreme pragmatism. The biggest trade-offs I made were around data normalization and asynchronous processing:

1. **Denormalizing Audit Results vs Normalizing:** I chose to store `input_stack`, `pricing_snapshot`, and `new_output_result` directly onto the `audits` table as JSONB columns. A more "enterprise" approach would involve a separate `audit_revisions` table or version-controlled `pricing_history` table. However, JSONB columns gave me 100% of the functionality needed for the diff page without requiring complex SQL joins or breaking the Round 1 routing logic.

2. **Synchronous Emailing:** The `POST /api/detect-changes` endpoint currently blocks while waiting for Resend to dispatch emails. In a real system with 13,000+ users, this would hit serverless timeout limits (10s on Vercel Hobby) and require a queue like Inngest, Defer, or AWS SQS. For the scope of this test, synchronous execution is significantly faster to implement and test.

3. **In-Memory Pricing Overrides vs DB Store:** Rather than building a CRUD dashboard to update pricing, I allowed the detector endpoint to accept a `newPrice` override and mutate the pricing array in-memory for the duration of the lambda execution. This perfectly satisfied the "detect changes" simulation without needing a massive admin interface.

## What I'm proud of
The system is incredibly robust because the deterministic engine `runAudit` is heavily reused. By writing a simple wrapper `getPlanPrice`, I was able to dynamically inject pricing into the rules without changing any core logic, keeping the app predictable and bug-free.

## What I would do with 7 more days
- **Queues:** Move the detection logic into an Inngest background function that processes batches of 50 users at a time.
- **Admin Dashboard:** Build a visual interface to manage pricing variables and instantly see how many audits would be affected by a change.
- **Unsubscribe Handling:** Properly build out the unsubscribe mechanics using Resend's webhook events and audience management tools.
