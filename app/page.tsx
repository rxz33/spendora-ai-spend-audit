"use client";

import { useRef } from "react";
import SpendFormWrapper from "@/components/spend-form-wrapper";

const pricingData = [
  {
    name: "Cursor",
    description: "Code editor with AI completion",
    plans: [
      { name: "Free", price: 0 },
      { name: "Pro", price: 20 },
    ],
  },
  {
    name: "GitHub Copilot",
    description: "AI code generation for developers",
    plans: [
      { name: "Individual", price: 10 },
      { name: "Business", price: 21 },
    ],
  },
  {
    name: "Claude",
    description: "Anthropic's AI assistant",
    plans: [
      { name: "Free", price: 0 },
      { name: "Claude Pro", price: 20 },
    ],
  },
  {
    name: "ChatGPT",
    description: "OpenAI's conversational AI",
    plans: [
      { name: "Free", price: 0 },
      { name: "Plus", price: 20 },
      { name: "Team", price: 30 },
    ],
  },
  {
    name: "Google Gemini",
    description: "Google's AI model",
    plans: [
      { name: "Free", price: 0 },
      { name: "Gemini Advanced", price: 20 },
    ],
  },
  {
    name: "Windsurf",
    description: "Codeium's AI code editor",
    plans: [
      { name: "Free", price: 0 },
      { name: "Pro", price: 15 },
    ],
  },
];

export default function HomePage() {
  const formRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  return (
    <main className="min-h-screen text-slate-900">
      <section className="border-b border-sky-200/70">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-sky-200 bg-white/70 px-4 py-1 text-sm text-sky-700 shadow-sm">
              AI Spend Optimization Platform
            </p>

            <h1 className="text-6xl font-bold leading-tight tracking-tight text-slate-900">
              Stop overpaying for AI tools
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-slate-600">
              Analyze your AI subscriptions,
              identify wasted spend, and
              discover cheaper alternatives
              for your team.
            </p>

            <div className="mt-8 flex gap-4">
              <button
                onClick={scrollToForm}
                className="rounded-xl bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-600"
              >
                Start Audit
              </button>

              <button
                onClick={scrollToPricing}
                className="rounded-xl border border-sky-200 bg-white/70 px-6 py-3 font-medium text-slate-700 transition hover:border-sky-300 hover:bg-white"
              >
                View Pricing Data
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={formRef}
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <SpendFormWrapper />
      </section>

      {/* PRICING DATA SECTION */}
      <section
        ref={pricingRef}
        className="border-t border-sky-200/70 bg-white/40 py-20 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-4xl font-bold text-slate-900">
            Pricing Data
          </h2>
          <p className="mb-12 text-slate-600">
            Current pricing and plan details for all
            supported AI tools
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pricingData.map((tool) => (
              <div
                key={tool.name}
                className="rounded-2xl border border-sky-200/70 bg-white/75 p-6 shadow-sm backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {tool.name}
                </h3>
                <p className="mt-4 text-sm text-slate-600">
                  {tool.description}
                </p>
                <div className="mt-6 space-y-2">
                  {tool.plans.map((plan) => (
                    <div
                      key={plan.name}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-600">
                        {plan.name}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ${plan.price}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
