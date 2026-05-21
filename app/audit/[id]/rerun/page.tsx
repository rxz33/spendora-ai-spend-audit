import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/server/supabase";
import { type AuditRecommendation } from "@/types/audit";

export const revalidate = 0;

function formatCurrency(value: number) {
  return `$${value.toFixed(0)}`;
}

export default async function RerunPage(props: { params: { id: string } }) {
  const { id } = props.params;
  const supabase = getSupabaseClient();

  const { data: audit, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !audit || !audit.new_output_result) {
    return notFound();
  }

  const oldTools = audit.tools as AuditRecommendation[];
  const newTools = audit.new_output_result as AuditRecommendation[];

  const oldSavings = oldTools.reduce((acc, item) => acc + item.monthlySavings, 0);
  const newSavings = newTools.reduce((acc, item) => acc + item.monthlySavings, 0);
  const delta = newSavings - oldSavings;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Pricing Update Diff</h1>
        <div className={`p-6 rounded-2xl border ${delta > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <h2 className="text-3xl font-bold">
            Savings Delta: {delta >= 0 ? '+' : ''}{formatCurrency(delta)}/mo
          </h2>
          <p className="mt-2 text-lg">
            Previously saving {formatCurrency(oldSavings)}/mo. Now saving {formatCurrency(newSavings)}/mo.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Original */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-slate-800">Original Audit</h3>
          {oldTools.map((tool, idx) => (
            <div key={idx} className="bg-white/70 p-6 rounded-2xl border border-slate-200 opacity-80">
              <h4 className="font-bold text-lg">{tool.currentTool}</h4>
              <p className="text-sm text-slate-600">Old Recommendation: {tool.recommendation}</p>
              <p className="font-semibold text-slate-700">Savings: {formatCurrency(tool.monthlySavings)}</p>
            </div>
          ))}
        </div>

        {/* New */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-slate-800">Updated Audit</h3>
          {newTools.map((tool, idx) => {
            const oldTool = oldTools[idx];
            const hasChanged = !oldTool || oldTool.recommendation !== tool.recommendation || oldTool.monthlySavings !== tool.monthlySavings;
            
            return (
              <div key={idx} className={`p-6 rounded-2xl border ${hasChanged ? 'bg-white border-emerald-400 shadow-md ring-2 ring-emerald-200' : 'bg-white/70 border-slate-200 opacity-80'}`}>
                <h4 className="font-bold text-lg text-slate-900">{tool.currentTool}</h4>
                <p className={`text-sm ${hasChanged ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                  New Recommendation: {tool.recommendation}
                </p>
                <p className="font-semibold text-slate-900">Savings: {formatCurrency(tool.monthlySavings)}</p>
                {hasChanged && (
                  <span className="inline-block mt-3 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Changed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
