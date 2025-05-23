import { NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/utils/supabase"
import { SAMPLE_FEATURES } from "@/utils/mock-data"

export async function POST() {
  try {
    const supabase = getServerSupabaseClient()

    // First, clear the existing sample data from features table
    const { error: deleteError } = await supabase
      .from("features")
      .delete()
      .neq("id", 0) // Delete all rows

    if (deleteError) {
      console.error("Error clearing existing features:", deleteError)
    }

    // Insert the sample features as real data
    const { error: insertError } = await supabase
      .from("features")
      .insert(SAMPLE_FEATURES)

    if (insertError) {
      console.error("Error inserting features:", insertError)
      throw insertError
    }

    return NextResponse.json({
      success: true,
      message: "Features table seeded successfully",
      count: SAMPLE_FEATURES.length
    })
  } catch (error) {
    console.error("Error seeding features:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error seeding features: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    )
  }
} 