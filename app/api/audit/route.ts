import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

interface AuditData {
  tools: Array<{
    tool: string;
    plan: string;
    currentSpend: number;
    recommendation: string;
    monthlySavings: number;
    reason: string;
  }>;
  monthlySavings: number;
  annualSavings: number;
  summary: string;
}

// POST: Store a new audit
export async function POST(req: Request) {
  try {
    const body: AuditData = await req.json();

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("audits")
      .insert([
        {
          tools: body.tools,
          monthly_savings: body.monthlySavings,
          annual_savings: body.annualSavings,
          total_recommendations: body.tools.length,
          summary: body.summary,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save audit" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving audit:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve a specific audit by ID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const auditId = searchParams.get("id");

    if (!auditId) {
      return NextResponse.json(
        { error: "Audit ID required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (error || !data) {
      console.error("Supabase select error:", error);
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error retrieving audit:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
