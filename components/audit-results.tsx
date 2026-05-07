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

  return (
    <div className="mt-12 space-y-6">
      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
        <h2 className="text-3xl font-bold">
          Estimated Monthly Savings
        </h2>

        <p className="mt-2 text-5xl font-bold text-green-400">
          ${totalSavings.toFixed(0)}/mo
        </p>

        <p className="mt-2 text-white/60">
          ${(totalSavings * 12).toFixed(0)} annually
        </p>
      </div>

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
                Current Plan: {result.currentPlan}
              </p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                ${result.monthlySavings.toFixed(0)}/mo
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
  );
}