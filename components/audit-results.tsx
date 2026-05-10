"use client";

import { useState } from "react";

interface AuditResult {
  currentTool: string;
  currentPlan: string;
  currentSpend: number;
  recommendation: string;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
}

function formatCurrency(value: number) {
  return `$${value.toFixed(0)}`;
}

export default function AuditResults({
  results,
  summary,
}: {
  results: AuditResult[];
  summary: string;
}) {
  const [leadEmail, setLeadEmail] =
    useState("");
  const [companyName, setCompanyName] =
    useState("");
  const [role, setRole] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [website, setWebsite] = useState("");
  const [leadLoading, setLeadLoading] =
    useState(false);
  const [leadSuccess, setLeadSuccess] =
    useState(false);
  const [leadEmailSent, setLeadEmailSent] =
    useState(false);
  const [leadError, setLeadError] =
    useState<string | null>(null);
  const [shareLoading, setShareLoading] =
    useState(false);
  const [shareUrl, setShareUrl] = useState<
    string | null
  >(null);
  const [shareCopied, setShareCopied] = useState(
    false
  );

  if (results.length === 0) {
    return null;
  }

  const totalSavings = results.reduce(
    (acc, item) => acc + item.monthlySavings,
    0
  );
  const annualSavings = totalSavings * 12;
  const optimizedTools = results.filter(
    (result) => result.monthlySavings > 0
  );
  const biggestOpportunity =
    optimizedTools.reduce<AuditResult | null>(
      (best, result) => {
        if (
          !best ||
          result.monthlySavings >
            best.monthlySavings
        ) {
          return result;
        }

        return best;
      },
      null
    );
  const isHighSavings = totalSavings >= 500;
  const isLowSavings = totalSavings < 100;
  const heroEyebrow = isHighSavings
    ? "High-value audit"
    : isLowSavings
    ? "Efficient setup"
    : "Actionable review";
  const heroTitle = isLowSavings
    ? "You're spending well on AI."
    : "Clear savings are available in your stack.";
  const heroCopy = isHighSavings
    ? "You have enough extra AI spend here that it is worth fixing now, not later."
    : isLowSavings
    ? "There are no major pricing mistakes in this setup. Your current mix looks reasonable for the team size and usage you entered."
    : "You are not far off, but there are still a few clear ways to lower monthly spend without changing how the team works too much.";

  const handleShareAudit = async () => {
    setShareLoading(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tools: results,
          monthlySavings: totalSavings,
          annualSavings,
          summary,
        }),
      });

      const data = await response.json();

      if (data.id) {
        const url = `${window.location.origin}/audit/${data.id}`;
        setShareUrl(url);
      }
    } catch (error) {
      console.error("Error sharing audit:", error);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(
      () => setShareCopied(false),
      2000
    );
  };

  const handleLeadCapture = async () => {
    setLeadLoading(true);
    setLeadError(null);
    setLeadSuccess(false);
    setLeadEmailSent(false);

    try {
      const response = await fetch(
        "/api/capture-lead",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: leadEmail,
            companyName,
            role,
            teamSize:
              teamSize === ""
                ? null
                : Number(teamSize),
            monthlySavings: totalSavings,
            annualSavings,
            website,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to capture lead"
        );
      }

      setLeadSuccess(true);
      setLeadEmailSent(
        Boolean(data.emailSent)
      );

      if (data.emailSent === false) {
        setLeadError(
          data.error ||
            "Lead saved, but confirmation email could not be sent."
        );
      }

      setLeadEmail("");
      setCompanyName("");
      setRole("");
      setTeamSize("");
      setWebsite("");
    } catch (error) {
      setLeadError(
        error instanceof Error
          ? error.message
          : "Failed to capture lead"
      );
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div className="mt-16 space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_34%),linear-gradient(135deg,_rgba(5,10,24,0.96),_rgba(12,18,34,0.98))] shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
        <div className="border-b border-white/10 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300/80">
                Shareable audit result
              </p>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Share this with your team when you want a simple view of what to keep, what to change, and how much money is on the table.
              </p>
            </div>

            {!shareUrl ? (
              <button
                onClick={handleShareAudit}
                disabled={shareLoading}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-300/18 disabled:opacity-50"
              >
                {shareLoading
                  ? "Creating share link..."
                  : "Create share link"}
              </button>
            ) : (
              <div className="flex flex-col gap-3 md:min-w-[420px]">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Share link ready
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/35 px-4 py-2.5 text-sm text-white/80"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    {shareCopied
                      ? "Copied"
                      : "Copy link"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
              {heroEyebrow}
            </div>

            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {heroTitle}
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                {heroCopy}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Monthly savings
                </p>
                <p className="mt-3 text-4xl font-semibold text-emerald-300">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Annual savings
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {formatCurrency(annualSavings)}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Tools reviewed
                </p>
                <p className="mt-3 text-4xl font-semibold text-white">
                  {results.length}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {optimizedTools.length} flagged for action
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Audit snapshot
            </p>

            {biggestOpportunity ? (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm text-slate-400">
                    Biggest savings opportunity
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {biggestOpportunity.currentTool}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {biggestOpportunity.recommendation}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/8 p-5">
                  <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">
                    Top savings lever
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-emerald-300">
                    {formatCurrency(
                      biggestOpportunity.monthlySavings
                    )}
                    <span className="ml-2 text-base font-medium text-emerald-100/80">
                      per month
                    </span>
                  </p>
                </div>

                <div className="space-y-3 text-sm leading-7 text-slate-300">
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
                    <span className="text-slate-400">
                      Current spend
                    </span>
                    <span className="font-medium text-white">
                      {formatCurrency(
                        biggestOpportunity.currentSpend
                      )}
                      /mo
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400">
                      Current plan
                    </span>
                    <span className="text-right font-medium text-white">
                      {biggestOpportunity.currentPlan}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/6 p-5">
                <p className="text-lg font-semibold text-white">
                  No major waste detected
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  This stack looks healthy right now. The best next step is to keep an eye on pricing changes instead of forcing a tool switch that will not save much.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {isHighSavings && (
        <section className="overflow-hidden rounded-[2rem] border border-emerald-400/25 bg-[linear-gradient(135deg,_rgba(6,78,59,0.92),_rgba(6,46,32,0.94))] shadow-[0_24px_70px_rgba(4,120,87,0.18)]">
          <div className="grid gap-6 px-6 py-8 md:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/75">
                Capture the savings
              </p>
              <h3 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                Credex should be part of this conversation.
              </h3>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50/88">
                At {formatCurrency(totalSavings)} per month, this is big enough to treat as a real procurement problem. Credex can help you turn these savings ideas into actual contract and pricing changes.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-black/22 p-6">
              <p className="text-sm font-medium text-emerald-100">
                Why involve Credex
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-emerald-50/85">
                <p>The monthly savings are large enough to be worth acting on.</p>
                <p>You may be able to negotiate better pricing or cut overlapping tools.</p>
                <p>This audit already shows where the biggest savings are.</p>
              </div>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
              >
                Talk to Credex
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(15,23,42,0.94),_rgba(7,10,20,0.98))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.32)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                Per-tool breakdown
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                Per-tool breakdown
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              For each tool, we show what you pay now, what we would change, and how much that could save.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            {results.map((result, index) => {
              const hasSavings =
                result.monthlySavings > 0;

              return (
                <article
                  key={index}
                  className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm md:p-6"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
                            hasSavings
                              ? "bg-emerald-400/12 text-emerald-300"
                              : "bg-slate-400/10 text-slate-300"
                          }`}
                        >
                          {hasSavings
                            ? "Action flagged"
                            : "Looks reasonable"}
                        </span>
                        <h4 className="text-2xl font-semibold text-white">
                          {result.currentTool}
                        </h4>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            You pay now
                          </p>
                          <p className="mt-3 text-lg font-semibold text-white">
                            {result.currentPlan}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatCurrency(
                              result.currentSpend
                            )}
                            /mo
                          </p>
                        </div>

                        <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            We suggest
                          </p>
                          <p className="mt-3 text-lg font-semibold text-white">
                            {result.recommendation}
                          </p>
                        </div>

                        <div
                          className={`rounded-[1.3rem] border p-4 ${
                            hasSavings
                              ? "border-emerald-400/20 bg-emerald-400/10"
                              : "border-slate-500/20 bg-slate-500/10"
                          }`}
                        >
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            You could save
                          </p>
                          <p
                            className={`mt-3 text-lg font-semibold ${
                              hasSavings
                                ? "text-emerald-300"
                                : "text-slate-200"
                            }`}
                          >
                            {formatCurrency(
                              result.monthlySavings
                            )}
                            /mo
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatCurrency(
                              result.annualSavings
                            )}{" "}
                            annually
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[1.3rem] border border-white/10 bg-black/22 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Why
                        </p>
                        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-300">
                          {result.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(17,24,39,0.96),_rgba(10,14,25,0.98))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:p-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-3 w-3 rounded-full bg-cyan-300" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                AI summary
              </p>
            </div>

            <p className="mt-5 text-lg leading-8 text-slate-200">
              {summary}
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(14,18,29,0.98),_rgba(8,11,21,1))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {isHighSavings
                ? "Credex follow-up"
                : "Notify me when the stack changes"}
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {isHighSavings
                ? "Want help acting on these savings?"
                : "Want updates when this changes?"}
            </h3>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {isHighSavings
                ? "Leave your work email and we will send the audit summary. Credex may also reach out if this level of savings looks worth pursuing."
                : "Leave your email and we will send this audit plus future updates if better savings options show up later."}
            </p>

            <div className="mt-6 grid gap-4">
              <input
                type="email"
                placeholder="Work email"
                value={leadEmail}
                onChange={(e) =>
                  setLeadEmail(e.target.value)
                }
                className="w-full rounded-[1.2rem] border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Company name (optional)"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(
                      e.target.value
                    )
                  }
                  className="w-full rounded-[1.2rem] border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500"
                />
                <input
                  type="text"
                  placeholder="Role (optional)"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="w-full rounded-[1.2rem] border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500"
                />
              </div>

              <input
                type="number"
                min="1"
                placeholder="Team size (optional)"
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(e.target.value)
                }
                className="w-full rounded-[1.2rem] border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500"
              />

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                placeholder="Leave blank"
                value={website}
                onChange={(e) =>
                  setWebsite(e.target.value)
                }
                className="hidden"
              />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <button
                onClick={handleLeadCapture}
                disabled={leadLoading}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  isHighSavings
                    ? "bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
                    : "bg-white text-slate-950 hover:bg-slate-200"
                }`}
              >
                {leadLoading
                  ? "Submitting..."
                  : isHighSavings
                  ? "Request Credex follow-up"
                  : "Notify me later"}
              </button>

              {leadSuccess && (
                <p className="text-sm text-emerald-300">
                  {leadEmailSent
                    ? "Lead captured. The confirmation email is on its way."
                    : "Lead captured, but the confirmation email was not sent."}
                </p>
              )}

              {leadError && (
                <p className="text-sm text-amber-300">
                  {leadError}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
