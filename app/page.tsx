import SpendFormWrapper from "@/components/spend-form-wrapper";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1 text-sm text-green-400">
              AI Spend Optimization Platform
            </p>

            <h1 className="text-6xl font-bold leading-tight tracking-tight">
              Stop overpaying for AI tools
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-white/70">
              Analyze your AI subscriptions,
              identify wasted spend, and
              discover cheaper alternatives
              for your team.
            </p>

            <div className="mt-8 flex gap-4">
              <button className="rounded-xl bg-white px-6 py-3 font-medium text-black">
                Start Audit
              </button>

              <button className="rounded-xl border border-white/10 px-6 py-3 font-medium">
                View Pricing Data
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <SpendFormWrapper />
      </section>
    </main>
  );
}