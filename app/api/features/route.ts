import { NextResponse } from "next/server";
import { saveFeaturesToSupabase, Feature } from "@/utils/supabase";

export async function POST(request: Request) {
  // Debug: Log presence of environment variables
  console.log("SUPABASE_URL present:", !!process.env.SUPABASE_URL)
  console.log("SUPABASE_SERVICE_ROLE_KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  try {
    const { features } = await request.json();
    if (!Array.isArray(features)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }
    try {
      await saveFeaturesToSupabase(features as Feature[]);
      return NextResponse.json({ success: true });
    } catch (supabaseError) {
      console.error("Supabase insert error:", supabaseError);
      return NextResponse.json({ success: false, error: String(supabaseError) }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 