import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/server/supabase";
import { Resend } from "resend";
import { pricingData } from "@/data/pricing";
import { runAudit } from "@/lib/audit-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool, newPrice } = body;

    if (!tool || newPrice === undefined) {
      return NextResponse.json({ error: "Missing tool or newPrice" }, { status: 400 });
    }

    // 1. Update pricing in memory (Dynamic Override)
    const toolIndex = pricingData.findIndex(t => t.tool.toLowerCase() === tool.toLowerCase());
    if (toolIndex >= 0) {
      // Find the Pro or Individual plan to update (most common)
      const plan = pricingData[toolIndex].plans.find(p => p.name === "Pro" || p.name === "Individual");
      if (plan) {
        plan.monthlyPrice = newPrice;
      }
    }

    // 2. Fetch audits
    const supabase = getSupabaseClient();
    const { data: audits, error } = await supabase
      .from("audits")
      .select("*")
      .not("user_email", "is", null);

    if (error || !audits) {
      return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    let emailsSent = 0;

    // 3. Compare and Re-run logic
    const affectedUsers = new Map<string, typeof audits>();

    for (const audit of audits) {
      if (!audit.input_stack) continue;

      // Re-run audit logic with the newly overridden pricing
      const newResults = runAudit(audit.input_stack);
      
      const oldRecs = JSON.stringify(audit.tools);
      const newRecs = JSON.stringify(newResults.recommendations);

      // 4. If recommendations changed, save to DB and group by email
      if (oldRecs !== newRecs) {
        await supabase
          .from("audits")
          .update({
            new_output_result: newResults.recommendations,
            new_pricing_snapshot: pricingData
          })
          .eq("id", audit.id);

        const userAudits = affectedUsers.get(audit.user_email) || [];
        userAudits.push(audit);
        affectedUsers.set(audit.user_email, userAudits);
      }
    }

    // 5. Send consolidated emails
    for (const [email, userAudits] of affectedUsers.entries()) {
      if (resend) {
        try {
          const linksHtml = userAudits.map((a) => {
            const rerunLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/audit/${a.id}/rerun`;
            return `<li><a href="${rerunLink}">View Diff for Audit ${a.id.slice(0,8)}</a></li>`;
          }).join('');

          await resend.emails.send({
            from: "Spendora <onboarding@resend.dev>",
            to: email,
            subject: "Pricing Update: Your AI Spend Audits Changed",
            html: `
              <h2>Pricing Update Detected</h2>
              <p>The price of <strong>${tool}</strong> has changed to $${newPrice}.</p>
              <p>This impacts ${userAudits.length} of your previous audits.</p>
              <ul>${linksHtml}</ul>
            `
          });
          emailsSent++;
        } catch (e) {
          console.error("Resend error:", e);
        }
      }
    }

    return NextResponse.json({ success: true, checked: audits.length, emailsSent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
