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
  params: { id: string };
}): Promise<Metadata> {
  const audit = await getAuditData(params.id);

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
      url: `https://spendora-ai-spend-audit.vercel.app/audit/${params.id}`,
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
  params: { id: string };
}) {
  const audit = await getAuditData(params.id);

  if (!audit) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              Audit Not Found
            </h1>
            <p className="mt-4 text-white/70">
              This audit link may have expired or is
              invalid.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-green-500 px-6 py-3 font-medium text-black hover:bg-green-400"
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
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="text-4xl font-bold">
            Your AI Spend Audit Results
          </h1>
          <p className="mt-2 text-white/60">
            Shared audit from Spendora
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* HERO SECTION */}
        <div
          className={`rounded-2xl border p-8 ${
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
                  ? "This team's AI tooling stack appears operationally efficient."
                  : "Optimization opportunities detected across subscriptions and vendor alternatives."}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-5xl font-bold text-green-400">
                ${audit.monthly_savings}/mo
              </p>

              <p className="mt-2 text-white/60">
                ${audit.annual_savings.toFixed(0)} annually
              </p>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS SECTION */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold">
            Per-Tool Breakdown
          </h3>

          <div className="mt-6 space-y-4">
            {audit.tools.map((tool, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {tool.tool} ({tool.plan})
                    </h4>

                    <p className="mt-2 text-white/70">
                      {tool.recommendation}
                    </p>

                    <p className="mt-3 text-sm text-white/50">
                      <span className="font-medium text-white/70">
                        Reasoning:
                      </span>{" "}
                      {tool.reason}
                    </p>
                  </div>

                  <div className="ml-6 text-right">
                    <p className="text-xl font-bold text-green-400">
                      ${tool.monthlySavings}/mo
                    </p>
                    <p className="text-sm text-white/60">
                      Current:{" "}
                      <span className="text-white">
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
          <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">
              AI Analysis Summary
            </h3>
            <p className="mt-4 leading-relaxed text-white/70">
              {audit.summary}
            </p>
          </div>
        )}

        {/* CTA SECTION */}
        {isHighSavings && (
          <div className="mt-12 rounded-lg border border-green-500/20 bg-green-500/10 p-8">
            <h3 className="text-2xl font-bold text-green-400">
              Significant Savings Opportunity
            </h3>

            <p className="mt-3 text-white/70">
              Teams saving more than $500/month often benefit
              from centralized procurement, vendor
              consolidation, and negotiated enterprise pricing
              through Credex.
            </p>

            <p className="mt-4 text-sm text-white/60">
              Get discounted AI infrastructure credits from
              Credex and capture more of these savings.
            </p>

            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-lg bg-green-500 px-6 py-3 font-medium text-black transition hover:bg-green-400"
            >
              Learn About Credex →
            </a>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-white/60">
          <p>
            This audit was generated by Spendora, a free AI
            spend optimization tool.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-green-400 hover:underline"
          >
            Run your own audit →
          </Link>
        </div>
      </section>
    </main>
  );
}
