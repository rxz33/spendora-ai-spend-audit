import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { Resend } from "resend";

export async function POST(req: Request) {
  const resend = new Resend(
    process.env.RESEND_API_KEY
  );

  const supabase =
  getSupabaseClient();

  try {
    const body = await req.json();

    // Honeypot spam protection
    if (body.website) {
      return NextResponse.json(
        { error: "Spam detected" },
        { status: 400 }
      );
    }

    const {
      email,
      companyName,
      role,
      teamSize,
      monthlySavings,
      annualSavings,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const isHighSavings =
      Number(monthlySavings) >= 500;

    const { error } = await supabase
      .from("audit_leads")
      .insert([
        {
          email,
          company_name: companyName,
          role,
          team_size:
            typeof teamSize === "number"
              ? teamSize
              : null,
          monthly_savings:
            monthlySavings,
          annual_savings:
            annualSavings,
        },
      ]);

    if (error) {
      throw error;
    }

    await resend.emails.send({
      from:
        "Spendora <onboarding@resend.dev>",
      to: email,
      subject:
        "Your Spendora AI Audit",
      html: `
        <h2>Your AI Spend Audit</h2>

        <p>
          Your audit identified approximately
          <strong>$${monthlySavings}/month</strong>
          in potential savings.
        </p>

        <p>
          ${
            isHighSavings
              ? "Your audit falls into a high-savings range, so Credex may reach out with procurement or vendor consolidation guidance."
              : "We'll notify you as new optimization opportunities become available."
          }
        </p>
      `,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to capture lead",
      },
      { status: 500 }
    );
  }
}
