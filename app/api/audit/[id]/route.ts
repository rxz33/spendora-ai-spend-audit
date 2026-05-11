import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/server/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auditId = id;

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Audit not found" },
        { status: 404 }
      );
    }

    // Check if audit has expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Audit link has expired" },
        { status: 410 }
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
