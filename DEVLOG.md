## Day 1 — 2026-05-07

**Hours worked:** 7

**What I did:** Set up the Next.js + TypeScript project, configured Tailwind CSS, initialized GitHub Actions CI, and deployed the initial version to Vercel. Created the initial architecture documentation and researched pricing structures for major AI vendors. Built the first version of the multi-tool spend input form, added localStorage persistence, and implemented deterministic audit rules for recommendations and savings calculations. Set up Vitest and added audit-engine tests. Also improved the audit results experience with dashboard metrics, honest recommendation states, and an executive summary section. Added Husky pre-commit checks for linting and tests.

**What I learned:** Deterministic audit logic is easier to test and reason about than AI-generated recommendations. I also learned that pricing models across AI vendors vary significantly between seat-based and usage-based billing, which affects recommendation quality and normalization logic.

**Blockers / what I'm stuck on:** Some vendor pricing pages are inconsistent in terminology and structure. I also had to refactor the localStorage hook after running into React effect warnings, and adjust audit rule prioritization to prevent overlapping recommendations.

**Plan for tomorrow:** Improve recommendation quality further, refine pricing data structures, continue documentation work, and start implementing additional product-level audit flows aligned with the assignment requirements.