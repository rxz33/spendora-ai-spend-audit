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

  const totalSavings = results.reduce(
    (acc, item) => acc + item.monthlySavings,
    0
  );

  const annualSavings = totalSavings * 12;

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
          annualSavings: annualSavings,
          summary: summary,
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
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(
        () => setShareCopied(false),
        2000
      );
    }
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

  if (results.length === 0) {
    return null;
  }

  const isHighSavings = totalSavings >= 500;

  const isLowSavings = totalSavings < 100;

  return (
    <div className="mt-12 space-y-6">
      {/* SHARE SECTION */}
      {!shareUrl && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/60">
            Share your audit results with your team
          </p>

          <button
            onClick={handleShareAudit}
            disabled={shareLoading}
            className="mt-4 rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {shareLoading
              ? "Creating Link..."
              : "Share Audit"}
          </button>
        </div>
      )}

      {/* SHARE URL DISPLAY */}
      {shareUrl && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
          <p className="text-sm text-blue-400">
            ✓ Shareable link created
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-lg bg-black/50 px-4 py-2 text-white/70"
            />

            <button
              onClick={handleCopyToClipboard}
              className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white transition hover:bg-blue-600"
            >
              {shareCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          <p className="mt-3 text-sm text-white/60">
            Share this link on Twitter, Slack, or email.
            It includes a nice preview!
          </p>
        </div>
      )}

      {/* HERO SECTION */}
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
              Teams saving more than $500/month often benefit from centralized
              procurement, vendor consolidation, and negotiated enterprise
              pricing through Credex.
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
              We&apos;ll notify you when pricing changes or new optimization
              opportunities become available for your AI stack.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm uppercase tracking-wide text-white/40">
          Lead Capture
        </p>

        <h3 className="mt-2 text-2xl font-semibold">
          {isHighSavings
            ? "Get Follow-Up From Credex"
            : "Get Audit Updates"}
        </h3>

        <p className="mt-3 max-w-3xl text-white/60">
          {isHighSavings
            ? "Share your work email and optional company details. We&apos;ll send your audit confirmation, and Credex may reach out for high-savings cases."
            : "Share your work email to receive your audit confirmation and future optimization updates. Company name, role, and team size are optional."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            type="email"
            placeholder="Work email"
            value={leadEmail}
            onChange={(e) =>
              setLeadEmail(e.target.value)
            }
            className="w-full rounded-lg bg-black p-3"
          />

          <input
            type="text"
            placeholder="Company name (optional)"
            value={companyName}
            onChange={(e) =>
              setCompanyName(
                e.target.value
              )
            }
            className="w-full rounded-lg bg-black p-3"
          />

          <input
            type="text"
            placeholder="Role (optional)"
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="w-full rounded-lg bg-black p-3"
          />

          <input
            type="number"
            min="1"
            placeholder="Team size (optional)"
            value={teamSize}
            onChange={(e) =>
              setTeamSize(e.target.value)
            }
            className="w-full rounded-lg bg-black p-3"
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

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <button
            onClick={handleLeadCapture}
            disabled={leadLoading}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {leadLoading
              ? "Submitting..."
              : isHighSavings
              ? "Request Follow-Up"
              : "Notify Me"}
          </button>

          {leadSuccess && (
            <p className="text-sm text-green-400">
              {leadEmailSent
                ? "Lead captured. Check your inbox for the confirmation email."
                : "Lead captured, but the confirmation email was not sent."}
            </p>
          )}

          {leadError && (
            <p className="text-sm text-red-400">
              {leadError}
            </p>
          )}
        </div>
      </div>

      {/* AI SUMMARY */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" />

          <p className="text-sm uppercase tracking-wide text-white/40">
            AI Audit Summary
          </p>
        </div>

        <p className="mt-4 max-w-4xl text-lg leading-8 text-white/70">
          {summary}
        </p>
      </div>

      {/* RECOMMENDATION CARDS */}
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
                  Current Plan: {result.currentPlan}
                </p>

                <p className="mt-1 text-white/60">
                  Current Spend: ${result.currentSpend}/mo
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-3xl font-bold text-green-400">
                  ${result.monthlySavings}/mo
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
