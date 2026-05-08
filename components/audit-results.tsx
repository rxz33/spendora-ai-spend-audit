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

  const annualSavings = totalSavings * 12;

  const isEfficient = totalSavings < 100;

  const showCredexCTA = totalSavings >= 500;

  const totalCurrentSpend = results.reduce(
    (acc, item) => acc + item.currentSpend,
    0
  );

  const totalAnnualSpend =
    totalCurrentSpend * 12;

  const optimizationCount = results.filter(
    (item) => item.monthlySavings > 0
  ).length;

  return (
    <>
      {isEfficient && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
          <h2 className="text-2xl font-bold text-blue-400">
            Your AI stack looks cost-efficient
          </h2>

          <p className="mt-2 max-w-2xl text-white/70">
            Based on your current subscriptions
            and usage patterns, there are
            limited optimization opportunities
            right now.
          </p>
        </div>
      )}

      <div className="mt-12 space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/60">
              Monthly Spend
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              $
              {totalCurrentSpend.toFixed(0)}
            </h2>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
            <p className="text-sm text-green-400">
              Potential Monthly Savings
            </p>

            <h2 className="mt-2 text-4xl font-bold text-green-400">
              ${totalSavings.toFixed(0)}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/60">
              Annual Spend
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              $
              {totalAnnualSpend.toFixed(0)}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/60">
              Opportunities
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {optimizationCount}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">
            Executive Summary
          </h2>

          <p className="mt-4 leading-7 text-white/70">
            Your current AI tooling stack was
            analyzed using deterministic pricing
            and utilization heuristics. The audit
            identified potential opportunities to
            reduce redundant subscriptions,
            optimize plan allocation, and
            consolidate overlapping vendors.
          </p>

          <p className="mt-4 leading-7 text-white/70">
            Estimated optimization potential:
            <span className="ml-2 font-semibold text-green-400">
              $
              {totalSavings.toFixed(0)}
              /month
            </span>{" "}
            ($
            {annualSavings.toFixed(0)}
            /year)
          </p>
        </div>

        {showCredexCTA && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
            <h2 className="text-3xl font-bold text-green-400">
              Significant Savings Opportunity
              Detected
            </h2>

            <p className="mt-3 max-w-3xl text-white/70">
              Your organization may be
              overspending on overlapping AI
              tooling. Credex can help
              consolidate vendors, optimize seat
              allocation, and reduce recurring
              software spend.
            </p>

            <button className="mt-6 rounded-xl bg-green-400 px-6 py-3 font-semibold text-black">
              Talk to Credex
            </button>
          </div>
        )}

        {results.map((result, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold">
                  {result.currentTool}
                </h3>

                <p className="text-white/60">
                  Current Plan:
                  {" "}
                  {result.currentPlan}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">
                  $
                  {result.monthlySavings.toFixed(
                    0
                  )}
                  /mo
                </p>

                <p className="text-white/60">
                  savings
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                {result.monthlySavings >= 10
                  ? "High Savings Opportunity"
                  : "Optimization Opportunity"}
              </div>

              <p className="font-medium">
                Recommendation:
              </p>

              <p className="mt-1 text-white/80">
                {result.recommendation}
              </p>

              <p className="mt-4 text-sm text-white/60">
                {result.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}