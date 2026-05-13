import { Metadata } from "next";
import Link from "next/link";

import { AutoFitText } from "@/components/auto-fit-text";
import { getSupabaseClient } from "@/server/supabase";

interface AuditData {
  id: string;
  tools: Array<{
    tool: string;
    plan: string;
    currentSpend: number;
    recommendation: string;
    monthlySavings: number;
    reason: string;
  }>;
  monthly_savings: number;
  annual_savings: number;
  summary: string;
  created_at: string;
}

async function getAuditData(
  id: string
): Promise<AuditData | null> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching audit:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAuditData(id);

  if (!audit) {
    return {
      title: "Audit Not Found",
      description: "This audit link may have expired or is invalid.",
    };
  }

  const savingsDescription =
    audit.monthly_savings > 0
      ? `Save $${audit.monthly_savings}/month on AI tools`
      : "AI spending optimization audit";

  return {
    title: `AI Spend Audit Results - $${audit.monthly_savings}/mo Savings`,
    description: savingsDescription,
    openGraph: {
      title: `AI Spend Audit: $${audit.monthly_savings}/month savings`,
      description: savingsDescription,
      type: "website",
      url: `https://spendora-ai-spend-audit.vercel.app/audit/${id}`,
      images: [
        {
          url: "https://spendora-ai-spend-audit.vercel.app/og-image.png",
          width: 1200,
          height: 630,
          alt: "Spendora Audit Results",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit: $${audit.monthly_savings}/month`,
      description: savingsDescription,
      images: [
        "https://spendora-ai-spend-audit.vercel.app/og-image.png",
      ],
    },
  };
}

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAuditData(id);

  if (!audit) {
    return (
      <main className="min-h-screen text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="rounded-[2rem] border border-white/70 bg-white/78 p-10 text-center shadow-[0_24px_80px_rgba(148,163,184,0.15)] backdrop-blur-xl">
            <h1 className="text-4xl font-bold text-slate-950">
              Audit Not Found
            </h1>
            <p className="mt-4 text-slate-600">
              This audit link may have expired or is invalid.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
            >
              Start a new audit
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isHighSavings =
    audit.monthly_savings >= 100;

  const isHealthy =
    audit.monthly_savings < 10;

  const hasOptimizationOpportunities =
    audit.monthly_savings >= 10 &&
    audit.monthly_savings < 50;

  const hasSignificantWaste =
    audit.monthly_savings >= 50;

  return (
    <main className="min-h-screen text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(245,243,255,0.98))] p-8 shadow-[0_24px_80px_rgba(148,163,184,0.16)] backdrop-blur-xl md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
            Shared audit
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
                {isHealthy
                  ? "This AI stack looks healthy"
                  : hasOptimizationOpportunities
                    ? "This stack has optimization opportunities"
                    : "This stack is leaving money on the table"}
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {isHealthy
                  ? "No major pricing mistakes. The current tool mix looks reasonable."
                  : hasSignificantWaste
                    ? "The savings here are large enough to act on now."
                    : "A few practical changes could lower recurring spend without adding much friction."}
              </p>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-2xl">
              <div className="rounded-3xl border border-sky-200/70 bg-white/88 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Monthly
                </p>
                <div className="mt-3">
                  <AutoFitText
                    className="font-bold tracking-tight text-sky-600"
                    maxRem={2.25}
                    maxRemMd={2.75}
                  >
                    {`$${audit.monthly_savings}`}
                  </AutoFitText>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  total savings opportunity
                </p>
              </div>
              <div className="rounded-3xl border border-violet-200/70 bg-white/88 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Annual
                </p>
                <div className="mt-3">
                  <AutoFitText
                    className="font-bold tracking-tight text-violet-600"
                    maxRem={2.25}
                    maxRemMd={2.75}
                  >
                    {`$${audit.annual_savings.toFixed(0)}`}
                  </AutoFitText>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  if nothing changes
                </p>
              </div>
              <div className="rounded-3xl border border-sky-200/70 bg-white/88 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Biggest move
                </p>
                <p className="mt-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                  {audit.tools[0]?.tool || "Review stack"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  highest-value recommendation shown below
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.13)] backdrop-blur-xl md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
              Per-tool breakdown
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              What to change and why
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Scan each tool by money first: current cost, next move, and savings.
            </p>

            <div className="mt-8 space-y-4">
              {audit.tools.map((tool, idx) => (
                <article
                  key={idx}
                  className="rounded-[1.6rem] border border-sky-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(245,243,255,0.88))] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {tool.tool}
                      </h3>
                      <p className="mt-1 text-slate-500">
                        Current plan: {tool.plan}
                      </p>
                    </div>

                    <div className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
                      ${tool.monthlySavings}/mo
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-sky-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        You pay now
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        ${tool.currentSpend}/mo
                      </p>
                    </div>

                    <div className="rounded-xl border border-sky-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        Suggested move
                      </p>
                      <p className="mt-2 text-lg font-semibold leading-7 text-slate-900">
                        {tool.recommendation}
                      </p>
                    </div>

                    <div className="rounded-xl border border-violet-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        You save
                      </p>
                      <p className="mt-2 text-3xl font-bold tracking-tight text-sky-600">
                        ${tool.monthlySavings}/mo
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        ${(tool.monthlySavings * 12).toFixed(0)} annually
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-sky-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Why
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {tool.reason}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {audit.summary && (
              <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.13)] backdrop-blur-xl md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
                  AI summary
                </p>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  {audit.summary}
                </p>
              </section>
            )}

            {isHighSavings && (
              <section className="rounded-[2rem] border border-violet-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.72),rgba(237,233,254,0.9))] p-6 shadow-[0_24px_80px_rgba(148,163,184,0.13)] md:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-800">
                  High-savings case
                </p>
                <h3 className="mt-2 text-3xl font-bold text-slate-950">
                  Credex can help capture these savings
                </h3>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  This is large enough to justify a vendor, pricing, or procurement conversation instead of treating it as a minor cleanup task.
                </p>
                <a
                  href="https://credex.rocks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
                >
                  Explore Credex
                </a>
              </section>
            )}

            <section className="rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.13)] backdrop-blur-xl md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-800">
                Built with Spendora
              </p>
              <p className="mt-4 leading-7 text-slate-600">
                This shared audit keeps the numbers, recommendations, and summary, while leaving out personal details.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-2xl border border-sky-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-sky-300"
              >
                Run your own audit
              </Link>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
