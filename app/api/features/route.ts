import { NextResponse } from "next/server";
import { getServerSupabaseClient, Feature } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const { features } = await request.json();
    if (!Array.isArray(features)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }
    
    const supabase = getServerSupabaseClient()
    
    // Clear existing features and insert new ones
    const { error: deleteError } = await supabase
      .from("features")
      .delete()
      .neq("id", 0) // Delete all rows

    if (deleteError) {
      console.error("Error clearing existing features:", deleteError)
    }

    // Insert new features
    const { error: insertError } = await supabase
      .from("features")
      .insert(features as Feature[])
    
    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/features:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getServerSupabaseClient()
    
    // Get features directly from database using server client
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      console.error("Database error fetching features:", error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      features: data || [],
      source: "supabase",
      count: data?.length || 0
    });
  } catch (error) {
    console.error("Error in GET /api/features:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
} 