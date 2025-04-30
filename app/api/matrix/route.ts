import { NextResponse } from "next/server"
import { EMBEDDED_MATRIX_DATA } from "@/matrix-data"
import { getMatrixDataFromSupabase, saveMatrixDataToSupabase, isSupabaseAvailable } from "@/utils/supabase"

// GET handler to retrieve the matrix data
export async function GET() {
  try {
    // First try to get data from Supabase
    const supabaseAvailable = await isSupabaseAvailable().catch(() => false)

    if (supabaseAvailable) {
      try {
        const supabaseData = await getMatrixDataFromSupabase()

        if (supabaseData.data && supabaseData.data.length > 0) {
          console.log("Using Supabase data:", supabaseData.data.length, "rows")
          return NextResponse.json({
            data: supabaseData.data,
            success: true,
            lastUpdated: supabaseData.lastUpdated,
            source: "supabase",
          })
        }
      } catch (supabaseError) {
        console.error("Error retrieving data from Supabase:", supabaseError)
        // Continue to fallback
      }
    }

    // If Supabase is not available or has no data, return embedded data
    return NextResponse.json({
      data: EMBEDDED_MATRIX_DATA,
      success: true,
      lastUpdated: new Date().toISOString(),
      message: "Using standard embedded matrix data.",
      source: "embedded_data",
    })
  } catch (error) {
    console.error("Error in GET handler:", error)

    // Return embedded data as fallback
    return NextResponse.json({
      data: EMBEDDED_MATRIX_DATA,
      success: true,
      error: `Error retrieving data: ${error instanceof Error ? error.message : "Unknown error"}`,
      lastUpdated: new Date().toISOString(),
      source: "embedded_data_fallback",
    })
  }
}

// POST handler to update the matrix data
export async function POST(request: Request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 },
      )
    }

    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format. Expected { data: [...] }",
        },
        { status: 400 },
      )
    }

    // Try to save to Supabase
    const supabaseAvailable = await isSupabaseAvailable().catch(() => false)

    if (supabaseAvailable) {
      try {
        const result = await saveMatrixDataToSupabase(body.data)

        return NextResponse.json({
          success: true,
          message: "Matrix data saved to Supabase successfully",
          lastUpdated: result.lastUpdated,
          source: "supabase",
        })
      } catch (supabaseError) {
        console.error("Failed to save to Supabase:", supabaseError)
        // Fall back to returning success with a warning
        return NextResponse.json({
          success: true,
          message: "Matrix data saved to browser storage only",
          warning: `Failed to save to Supabase: ${supabaseError instanceof Error ? supabaseError.message : "Unknown error"}. Data is only stored in your browser.`,
          lastUpdated: new Date().toISOString(),
          source: "localStorage_only",
        })
      }
    } else {
      // Supabase not available, but we'll still save to localStorage on the client
      return NextResponse.json({
        success: true,
        message: "Matrix data saved to browser storage only",
        warning: "Supabase is not available. Data is only stored in your browser.",
        lastUpdated: new Date().toISOString(),
        source: "localStorage_only",
      })
    }
  } catch (error) {
    console.error("Error updating matrix data:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
