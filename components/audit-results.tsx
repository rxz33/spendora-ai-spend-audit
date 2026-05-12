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
    <div className="mt-12 space-y-6 text-slate-900">
      <section className="rounded-3xl border border-emerald-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.95),rgba(245,243,255,0.98))] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700/70">
              Audit Results
            </p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              {isLowSavings
                ? "Your AI spend looks healthy"
                : "You are leaving money on the table"}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              {isHighSavings
                ? "These savings are large enough to act on now."
                : isLowSavings
                ? "No major pricing mistakes. This setup looks reasonable."
                : "A few changes could lower recurring spend without adding much friction."}
            </p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-2xl">
            <div className="rounded-3xl border border-emerald-200/70 bg-white/88 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Monthly
              </p>
              <p className="mt-3 text-5xl font-bold tracking-tight text-emerald-600 md:text-6xl">
                {formatCurrency(totalSavings)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                total savings opportunity
              </p>
            </div>
            <div className="rounded-3xl border border-violet-200/70 bg-white/88 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Annual
              </p>
              <p className="mt-3 text-5xl font-bold tracking-tight text-violet-600 md:text-6xl">
                {formatCurrency(annualSavings)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                if you keep this stack unchanged
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-200/70 bg-white/88 p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Biggest move
              </p>
              <p className="mt-3 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                {biggestOpportunity
                  ? biggestOpportunity.currentTool
                  : "No urgent change"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {biggestOpportunity
                  ? `${formatCurrency(
                      biggestOpportunity.monthlySavings
                    )}/mo is the clearest win`
                  : "no major waste detected"}
              </p>
            </div>
          </div>
        </div>

        {biggestOpportunity && (
          <div className="mt-6 rounded-3xl border border-emerald-200/70 bg-white/82 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Start here
            </p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {biggestOpportunity.currentTool}
                </p>
                <p className="mt-1 text-base text-slate-600">
                  {biggestOpportunity.recommendation}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-4xl font-bold tracking-tight text-emerald-600">
                  {formatCurrency(
                    biggestOpportunity.monthlySavings
                  )}
                  /mo
                </p>
                <p className="text-sm text-slate-500">
                  biggest single savings lever
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-emerald-200/70 bg-white/75 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700/70">
              Share Audit
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              Save this result as a public link
            </h3>
          </div>

          {!shareUrl && (
            <button
              onClick={handleShareAudit}
              disabled={shareLoading}
              className="rounded-xl border border-sky-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-sky-300 disabled:opacity-50"
            >
              {shareLoading
                ? "Creating link..."
                : "Create share link"}
            </button>
          )}
        </div>

        {shareUrl && (
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-700"
            />
            <button
              onClick={handleCopyToClipboard}
              className="rounded-xl bg-violet-200 px-5 py-3 font-medium text-violet-900 transition hover:bg-violet-300"
            >
              {shareCopied ? "Copied" : "Copy link"}
            </button>
          </div>
        )}
      </section>

      {isHighSavings && (
        <section className="rounded-3xl border border-violet-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.7),rgba(237,233,254,0.9))] p-6 shadow-sm md:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-violet-700/70">
            High-Savings Case
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-900">
            Credex can help capture these savings
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            At {formatCurrency(totalSavings)} per month, this is more than a small cleanup. It is worth looking at vendor consolidation, better pricing, and procurement support.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white transition hover:bg-emerald-600"
          >
            Talk to Credex
          </a>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <div className="rounded-3xl border border-emerald-200/70 bg-white/75 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-700/70">
                Per-Tool Breakdown
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                What you pay, what to change, and why
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Scan left to right: cost now, change next, money saved.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {results.map((result, index) => {
              const hasSavings =
                result.monthlySavings > 0;

              return (
                <article
                  key={index}
                  className="rounded-2xl border border-emerald-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(245,243,255,0.9))] p-5"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-slate-900">
                          {result.currentTool}
                        </h4>
                        <p className="mt-1 text-slate-600">
                          Current plan: {result.currentPlan}
                        </p>
                      </div>

                      <div
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          hasSavings
                            ? "bg-emerald-100 text-sky-700"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {hasSavings
                          ? `${formatCurrency(
                              result.monthlySavings
                            )}/mo`
                          : "No major savings found"}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-emerald-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          You pay now
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {formatCurrency(
                            result.currentSpend
                          )}
                          /mo
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          We suggest
                        </p>
                        <p className="mt-2 text-lg font-semibold leading-7 text-slate-900">
                          {result.recommendation}
                        </p>
                      </div>

                      <div className="rounded-xl border border-emerald-100 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          You could save
                        </p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                          {formatCurrency(
                            result.monthlySavings
                          )}
                          /mo
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatCurrency(
                            result.annualSavings
                          )}{" "}
                          annually
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        Why
                      </p>
                      <p className="mt-2 text-base leading-7 text-slate-600">
                        {result.reason}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-emerald-200/70 bg-white/75 p-6 shadow-sm md:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700/70">
              AI Summary
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {summary}
            </p>
          </section>

          <section className="rounded-3xl border border-emerald-200/70 bg-white/75 p-6 shadow-sm md:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700/70">
              {isHighSavings
                ? "Follow-Up"
                : "Stay Updated"}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {isHighSavings
                ? "Want help acting on this?"
                : "Want updates when better savings appear?"}
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              {isHighSavings
                ? "Leave your work email and we will send this audit now. Credex may also reach out if this looks like a strong fit for procurement support."
                : "Leave your email and we will send this audit plus future updates if pricing changes create better savings opportunities."}
            </p>

            <div className="mt-6 grid gap-4">
              <input
                type="email"
                placeholder="Work email"
                value={leadEmail}
                onChange={(e) =>
                  setLeadEmail(e.target.value)
                }
                className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
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
                  className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Role (optional)"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <input
                type="number"
                min="0"
                placeholder="Team size (optional)"
                value={teamSize}
                onChange={(e) =>
                  setTeamSize(
                    e.target.value === ""
                      ? ""
                      : String(
                          Math.max(
                            Number(
                              e.target.value
                            ),
                            0
                          )
                        )
                  )
                }
                className="w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
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
                className={`rounded-xl px-5 py-3 font-medium transition disabled:opacity-50 ${
                  isHighSavings
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-violet-200 text-violet-900 hover:bg-violet-300"
                }`}
              >
                {leadLoading
                  ? "Submitting..."
                  : isHighSavings
                  ? "Request follow-up"
                  : "Notify me"}
              </button>

              {leadSuccess && (
                <p className="text-sm text-emerald-600">
                  {leadEmailSent
                    ? "Lead captured. The confirmation email is on its way."
                    : "Lead captured, but the confirmation email was not sent."}
                </p>
              )}

              {leadError && (
                <p className="text-sm text-violet-700">
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
