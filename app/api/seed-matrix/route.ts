import { NextResponse } from "next/server"
import { EMBEDDED_MATRIX_DATA } from "@/matrix-data"
import { saveMatrixDataToSupabase, isSupabaseAvailable } from "@/utils/supabase"

// POST handler to seed the matrix data
export async function POST() {
  try {
    // Check if Supabase is available
    const supabaseAvailable = await isSupabaseAvailable().catch(() => false)

    if (!supabaseAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase is not available",
        },
        { status: 503 },
      )
    }

    // Seed the database with the embedded data
    const result = await saveMatrixDataToSupabase(EMBEDDED_MATRIX_DATA)

    return NextResponse.json({
      success: true,
      message: "Matrix data seeded successfully",
      lastUpdated: result.lastUpdated,
      rowCount: EMBEDDED_MATRIX_DATA.length,
    })
  } catch (error) {
    console.error("Error seeding matrix data:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
