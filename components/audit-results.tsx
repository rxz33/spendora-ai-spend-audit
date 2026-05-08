interface AuditResult {
  currentTool: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

export default function AuditResults({
  results,
}: {
  results: AuditResult[];
}) {
  if (results.length === 0) {
    return null;
  }

  const totalSavings = results.reduce(
    (acc, item) => acc + item.monthlySavings,
    0
  );

  const annualSavings =
    totalSavings * 12;

  const isHighSavings =
    totalSavings >= 500;

  const isLowSavings =
    totalSavings < 100;

  return (
    <div className="mt-12 space-y-6">
      <div
        className={`rounded-2xl border p-6 ${
          isHighSavings
            ? "border-green-500/30 bg-green-500/10"
            : isLowSavings
            ? "border-blue-500/20 bg-blue-500/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {isLowSavings
                ? "Your AI Spend Looks Healthy"
                : "Estimated Savings Opportunity"}
            </h2>

            <p className="mt-3 max-w-2xl text-white/60">
              {isLowSavings
                ? "Your current AI tooling stack appears operationally efficient based on the usage information provided."
                : "Optimization opportunities detected across overlapping subscriptions, inefficient plans, and vendor alternatives."}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-5xl font-bold text-green-400">
              ${totalSavings}/mo
            </p>

            <p className="mt-2 text-white/60">
              ${annualSavings.toFixed(0)} annually
            </p>
          </div>
        </div>

        {isHighSavings && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-black/30 p-5">
            <p className="text-lg font-semibold text-green-400">
              Significant Savings Opportunity
            </p>

            <p className="mt-2 text-white/70">
              Teams saving more than
              $500/month often benefit from
              centralized procurement,
              vendor consolidation, and
              negotiated enterprise pricing
              through Credex.
            </p>

            <button className="mt-4 rounded-lg bg-green-500 px-5 py-3 font-medium text-black transition hover:bg-green-400">
              Talk to Credex
            </button>
          </div>
        )}

        {isLowSavings && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
            <p className="text-lg font-semibold">
              Stay Updated
            </p>

            <p className="mt-2 text-white/60">
              We&apos;ll notify you when
              pricing changes or new
              optimization opportunities
              become available for your AI
              stack.
            </p>

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full rounded-lg bg-black p-3"
              />

              <button className="rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-white/90">
                Notify Me
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {results.map((result, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  Savings Opportunity
                </div>

                <h3 className="text-2xl font-semibold">
                  {result.currentTool}
                </h3>

                <p className="mt-1 text-white/60">
                  Current Plan:{" "}
                  {result.currentPlan}
                </p>

                <p className="mt-1 text-white/60">
                  Current Spend: $
                  {result.currentSpend}/mo
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-3xl font-bold text-green-400">
                  $
                  {result.monthlySavings}
                  /mo
                </p>

                <p className="mt-1 text-white/60">
                  savings
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm uppercase tracking-wide text-white/40">
                Recommendation
              </p>

              <p className="mt-2 text-lg font-medium text-white">
                {result.recommendation}
              </p>

              <p className="mt-4 max-w-3xl text-white/60">
                {result.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}