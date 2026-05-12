"use client";

import { useRef } from "react";
import SpendFormWrapper from "@/components/spend-form-wrapper";

import { pricingData } from "@/data/pricing";

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.9),transparent_34%),radial-gradient(circle_at_top_right,rgba(233,213,255,0.85),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.15))]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
                Spendora x Credex-style audit workflow
              </p>

              <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
                Find wasted AI spend before it becomes normal.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
                Run a clean audit of your team&apos;s AI tools, see exactly where money is leaking, and turn the result into something worth sharing with founders or procurement.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={scrollToForm}
                  className="rounded-2xl bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_32px_rgba(14,165,233,0.24)] transition hover:bg-emerald-600"
                >
                  Start free audit
                </button>

                <button
                  onClick={scrollToPricing}
                  className="rounded-2xl border border-emerald-200 bg-white/80 px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-white"
                >
                  Browse pricing data
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.18)] backdrop-blur-xl md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <p className="text-sm font-medium text-slate-700">
                    What you get
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    Per-tool savings view
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Current spend, recommended action, and the exact savings tied to that move.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-5">
                  <p className="text-sm font-medium text-slate-700">
                    Output
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    Shareable audit result
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    A clean result page built to be screenshotted, forwarded, and discussed.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:col-span-2">
                  <p className="text-sm font-medium text-slate-700">
                    Best for
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {[
                      "Founders",
                      "Engineering leads",
                      "Ops teams",
                      "Procurement reviews",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={formRef} className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <div className="rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-[0_24px_80px_rgba(148,163,184,0.14)] backdrop-blur-xl md:p-8">
          <SpendFormWrapper />
        </div>
      </section>

      <section ref={pricingRef} className="mx-auto max-w-6xl px-6 pb-20 pt-8 md:pb-24">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-800">
              Pricing data
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-950">
              Current plan pricing behind the audit
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-700">
            These reference prices power the audit recommendations and keep the savings math transparent.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pricingData.map((tool, index) => (
            <div
              key={tool.tool}
              className={`rounded-[1.7rem] border p-6 shadow-sm backdrop-blur-sm ${
                index % 3 === 0
                   ? "border-emerald-200 bg-white/78"
                   : index % 3 === 1
                   ? "border-violet-200 bg-violet-50/70"
                   : "border-emerald-100 bg-emerald-50/70"
               }`}
             >
               <h3 className="text-xl font-semibold text-slate-900">
                 {tool.tool}
               </h3>
               <p className="mt-2 text-sm leading-7 text-slate-700">
                 {tool.category}
               </p>
 
               <div className="mt-6 space-y-3">
                 {tool.plans.map((plan) => (
                   <div
                     key={plan.name}
                     className="flex items-center justify-between rounded-xl border border-white/70 bg-white/75 px-4 py-3 text-sm"
                   >
                     <span className="text-slate-700">
                       {plan.name}
                     </span>
                     <span className="font-semibold text-slate-900">
                       ${plan.monthlyPrice}/mo
                     </span>
                   </div>
                 ))}
               </div>
             </div>
           ))}
         </div>
      </section>
    </main>
  );
}
