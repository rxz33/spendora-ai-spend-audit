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
    <main className="min-h-screen bg-black text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1 text-sm text-green-400">
              AI Spend Optimization Platform
            </p>

            <h1 className="text-6xl font-bold leading-tight tracking-tight">
              Stop overpaying for AI tools
            </h1>

            <p className="mt-6 max-w-2xl text-xl text-white/70">
              Analyze your AI subscriptions,
              identify wasted spend, and
              discover cheaper alternatives
              for your team.
            </p>

            <div className="mt-8 flex gap-4">
              <button
                onClick={scrollToForm}
                className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-white/90"
              >
                Start Audit
              </button>

              <button
                onClick={scrollToPricing}
                className="rounded-xl border border-white/10 px-6 py-3 font-medium transition hover:border-white/30"
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
        className="border-t border-white/10 bg-white/5 py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-4xl font-bold">
            Pricing Data
          </h2>
          <p className="mb-12 text-white/60">
            Current pricing and plan details for all
            supported AI tools
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pricingData.map((tool) => (
              <div
                key={tool.name}
                className="rounded-lg border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-lg font-semibold">
                  {tool.name}
                </h3>
                <p className="mt-4 text-sm text-white/60">
                  {tool.description}
                </p>
                <div className="mt-6 space-y-2">
                  {tool.plans.map((plan) => (
                    <div
                      key={plan.name}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-white/70">
                        {plan.name}
                      </span>
                      <span className="font-semibold">
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