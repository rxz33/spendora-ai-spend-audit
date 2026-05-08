## Day 1 — 2026-05-07

**Hours worked:** 7

**What I did:** Set up the Next.js + TypeScript project, configured Tailwind CSS, initialized GitHub Actions CI, and deployed the initial version to Vercel. Created the initial architecture documentation and researched pricing structures for major AI vendors. Built the first version of the multi-tool spend input form, added localStorage persistence, and implemented deterministic audit rules for recommendations and savings calculations. Set up Vitest and added audit-engine tests. Also improved the audit results experience with dashboard metrics, honest recommendation states, and an executive summary section. Added Husky pre-commit checks for linting and tests.

**What I learned:** Deterministic audit logic is easier to test and reason about than AI-generated recommendations. I also learned that pricing models across AI vendors vary significantly between seat-based and usage-based billing, which affects recommendation quality and normalization logic.

**Blockers / what I'm stuck on:** Some vendor pricing pages are inconsistent in terminology and structure. I also had to refactor the localStorage hook after running into React effect warnings, and adjust audit rule prioritization to prevent overlapping recommendations.

**Plan for tomorrow:** Improve recommendation quality further, refine pricing data structures, continue documentation work, and start implementing additional product-level audit flows aligned with the assignment requirements.

## Day 2 — 2026-05-08

**Hours worked:** 7-8

**What I did:** Continued building the Spendora MVP by completing the deterministic audit engine and improving the spend input workflow. Added support for multiple AI vendors, plan-aware pricing selection, localStorage persistence, and structured pricing data. Implemented audit recommendation logic for inefficient team plans, overlapping subscriptions, cheaper alternatives, and API/credit-based optimization opportunities. Improved the audit results experience with honest low-savings states, savings summaries, and Credex CTA handling for larger optimization opportunities. Added Vitest coverage, Husky pre-commit hooks, and CI quality checks. Also conducted user research conversations with developers and engineers using Claude, ChatGPT, Copilot, and free-tier AI tooling.

**What I learned:** Most engineers using AI tools are not directly aware of pricing or procurement decisions. Teams often continue using whichever tools are already provisioned internally instead of actively comparing alternatives. I also learned that honest “no major savings found” states are important for building trust in optimization products.

**Blockers / what I'm stuck on:** Vendor pricing structures are inconsistent between seat-based subscriptions and usage-based APIs. Some interview responses were short or vague, which made extracting actionable insights harder than expected.

**Plan for tomorrow:** Finalize repository polish, improve documentation quality, complete README refinements, and prepare the project for a full review pass against the assignment requirements.