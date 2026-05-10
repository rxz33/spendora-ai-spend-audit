import { Metadata } from "next";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";

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

// Server-side data fetching for OG tags
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

// Dynamic metadata generation for OG tags
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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900">
              Audit Not Found
            </h1>
            <p className="mt-4 text-slate-600">
              This audit link may have expired or is
              invalid.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-sky-500 px-6 py-3 font-medium text-white hover:bg-sky-600"
            >
              Start a New Audit
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isHighSavings =
    audit.monthly_savings >= 500;
  const isLowSavings =
    audit.monthly_savings < 100;

  return (
    <main className="min-h-screen text-slate-900">
      <section className="border-b border-sky-200/70">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl font-bold text-slate-900">
            Your AI Spend Audit Results
          </h1>
          <p className="mt-2 text-slate-600">
            Shared audit from Spendora
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* HERO SECTION */}
        <div
          className={`rounded-2xl border p-8 ${
            isHighSavings
              ? "border-violet-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.72),rgba(237,233,254,0.9))]"
              : isLowSavings
              ? "border-sky-200/70 bg-white/75"
              : "border-sky-200/70 bg-white/75"
          }`}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {isLowSavings
                  ? "Your AI Spend Looks Healthy"
                  : "Estimated Savings Opportunity"}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-600">
                {isLowSavings
                  ? "This team's AI tooling stack appears operationally efficient."
                  : "Optimization opportunities detected across subscriptions and vendor alternatives."}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-5xl font-bold text-sky-600">
                ${audit.monthly_savings}/mo
              </p>

              <p className="mt-2 text-slate-600">
                ${audit.annual_savings.toFixed(0)} annually
              </p>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS SECTION */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-slate-900">
            Per-Tool Breakdown
          </h3>

          <div className="mt-6 space-y-4">
            {audit.tools.map((tool, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-sky-200/70 bg-white/75 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {tool.tool} ({tool.plan})
                    </h4>

                    <p className="mt-2 text-slate-600">
                      {tool.recommendation}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">
                        Reasoning:
                      </span>{" "}
                      {tool.reason}
                    </p>
                  </div>

                  <div className="ml-6 text-right">
                    <p className="text-xl font-bold text-sky-600">
                      ${tool.monthlySavings}/mo
                    </p>
                    <p className="text-sm text-slate-500">
                      Current:{" "}
                      <span className="text-slate-900">
                        ${tool.currentSpend}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI SUMMARY SECTION */}
        {audit.summary && (
          <div className="mt-12 rounded-2xl border border-sky-200/70 bg-white/75 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              AI Analysis Summary
            </h3>
            <p className="mt-4 leading-relaxed text-slate-600">
              {audit.summary}
            </p>
          </div>
        )}

        {/* CTA SECTION */}
        {isHighSavings && (
          <div className="mt-12 rounded-2xl border border-violet-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.72),rgba(237,233,254,0.9))] p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">
              Significant Savings Opportunity
            </h3>

            <p className="mt-3 text-slate-600">
              Teams saving more than $500/month often benefit
              from centralized procurement, vendor
              consolidation, and negotiated enterprise pricing
              through Credex.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Get discounted AI infrastructure credits from
              Credex and capture more of these savings.
            </p>

            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-lg bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-600"
            >
              Learn About Credex →
            </a>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 border-t border-sky-200/70 pt-8 text-center text-slate-600">
          <p>
            This audit was generated by Spendora, a free AI
            spend optimization tool.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sky-600 hover:underline"
          >
            Run your own audit →
          </Link>
        </div>
      </section>
    </main>
  );
}
