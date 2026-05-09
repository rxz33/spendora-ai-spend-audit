# REFLECTION.md

# 1. The hardest bug I hit this week, and how I debugged it

The hardest bug I encountered was a deployment/build issue where the application built successfully on my local machine but consistently failed in GitHub Actions during the production build step. Initially, this was confusing because all local checks (`npm run lint`, `npm run test`, and `npm run build`) passed without issues.

My first hypothesis was that the issue was related to TypeScript or Turbopack differences between local and CI environments. I reviewed the build logs carefully and noticed the failures occurred during “Collecting page data” for API routes rather than during compilation itself. The key clue was the error message: “Missing credentials” and later “supabaseUrl is required.”

I realized the actual issue was that I had initialized external SDK clients (OpenAI/Groq, Resend, and Supabase) at the module level. Locally, this worked because `.env.local` existed, but GitHub Actions did not have those environment variables configured during build time. Next.js evaluates route modules during the build process, which caused initialization failures.

To fix it, I refactored all SDK initialization into runtime execution inside the API route handlers (`POST()` functions) rather than top-level scope. I also changed Supabase initialization into a lazy getter function instead of a singleton export. After these changes, the CI pipeline passed successfully.

This bug taught me the difference between build-time execution and runtime execution in Next.js App Router/serverless environments, which was one of the most valuable engineering lessons from the project.

---

# 2. A decision I reversed mid-week, and what made me reverse it

One important decision I reversed mid-week was how I handled localStorage persistence and hydration in the spend audit form.

Initially, I attempted to solve hydration mismatches using a mounted-state workaround inside the client component. I added a `mounted` state variable with `useEffect()` to delay rendering until the client had mounted. This removed the hydration error locally, but React lint rules flagged the pattern as problematic, and the implementation felt more like a workaround than a clean architectural solution.

After investigating further, I realized the deeper issue was that the spend form depended heavily on client-only state (`localStorage`) and therefore did not benefit from server-side rendering at all. Instead of patching hydration after render, I decided to reverse my earlier approach entirely and disable SSR for the form component using a dynamic client-side wrapper component.

This refactor simplified the architecture significantly. The form became explicitly client-rendered, hydration mismatches disappeared cleanly, and the resulting implementation aligned much better with how dashboards and persisted forms are commonly handled in production React applications.

Reversing this decision improved both code quality and conceptual clarity. It also reinforced an important lesson for me: sometimes fixing symptoms incrementally is worse than stepping back and redesigning the underlying architecture more appropriately.

---

# 3. What I would build in week 2 if I had it

If I had an additional week, I would focus less on expanding the deterministic audit logic itself and more on turning the product into a genuinely useful operational tool for engineering managers and startup founders.

The first feature I would build is persistent shareable audit reports with public URLs, allowing teams to save, compare, and revisit historical audits over time. This would make the product more collaborative and more realistic as an internal procurement tool.

Second, I would implement organization-level analytics dashboards. Instead of a single audit session, teams could track:
- AI spend growth over time
- vendor concentration risk
- tool overlap trends
- API vs subscription cost distribution
- estimated annual savings trajectories

Third, I would expand the recommendation engine with more operational context:
- seat utilization analysis
- inactive subscription detection
- duplicate capability mapping
- enterprise pricing threshold alerts
- ROI estimates for vendor consolidation

I would also improve onboarding and lead qualification by adding role-based recommendations (engineering manager vs founder vs procurement lead).

Finally, I would invest heavily in polish:
- better mobile UX
- richer charts and visualizations
- improved loading states
- exportable PDF audit reports
- automated pricing refresh pipelines

The current MVP proves the core audit concept. Week 2 would focus on turning it into a credible internal tooling procurement platform.

---

# 4. How I used AI tools

I used AI tools extensively during this project, primarily as engineering accelerators and thought partners rather than as systems that generated final business logic automatically.

The main tools I used were ChatGPT and GitHub Copilot. I used them for:
- brainstorming architecture options
- debugging Next.js and hydration issues
- generating boilerplate API integrations
- improving TypeScript typing
- refining UI copy
- reviewing edge cases
- structuring documentation

However, I intentionally did not trust AI tools with the core audit logic itself. The assignment specifically emphasized that the audit engine should remain deterministic and rule-based, and I agreed with that design philosophy. Savings calculations, overlap detection, and optimization rules were implemented manually because deterministic logic is easier to reason about, explain, and validate financially.

One specific example where AI was wrong occurred during the hydration mismatch debugging process. An earlier AI suggestion recommended solving the issue entirely with mounted-state guards inside the component. While this temporarily removed the hydration error, it introduced React lint issues and ultimately was not the cleanest architectural solution. After investigating further, I realized the better approach was to disable SSR for the localStorage-dependent form entirely through a client-only wrapper component.

That experience reinforced an important principle for me: AI tools are extremely useful for accelerating exploration and debugging, but architectural judgment and final engineering decisions still require human reasoning and verification.

---

# 5. Self-rating

## Discipline — 8/10

I maintained consistent iteration throughout the project, pushed frequent commits, documented decisions carefully, and continuously tested builds/linting rather than postponing quality checks until the end.

## Code Quality — 8/10

I focused heavily on deterministic logic, clear component separation, TypeScript safety, graceful failure handling, and CI validation, although there are still areas where the architecture could be simplified further with more time.

## Design Sense — 7/10

I believe the UI is visually clean, operationally focused, and reasonably polished, especially around hierarchy and recommendation presentation, though I would improve responsiveness and visual consistency further in a second iteration.

## Problem Solving — 9/10

The most rewarding part of the project was debugging complex App Router build/runtime issues and iteratively improving the architecture rather than applying superficial fixes.

## Entrepreneurial Thinking — 8/10

I intentionally positioned the product as a realistic procurement-style AI spend optimization tool rather than a generic AI demo, and I focused on operational usefulness, lead capture, and believable business workflows throughout the implementation.