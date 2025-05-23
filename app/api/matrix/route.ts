import { NextResponse } from "next/server"
import { EMBEDDED_MATRIX_DATA } from "@/matrix-data"
import { getServerSupabaseClient } from "@/utils/supabase"

// GET handler to retrieve the matrix data
export async function GET() {
  try {
    // First try to get data from Supabase using server client
    try {
      const supabase = getServerSupabaseClient()
      
      // Test connection with a simple query
      const { data, error } = await supabase.from("matrix_data").select("*").order("id", { ascending: true })

      if (!error && data && data.length > 0) {
        console.log("Using Supabase data:", data.length, "rows")
        
        // Get the last updated timestamp
        const { data: metaData } = await supabase
          .from("matrix_metadata")
          .select("last_updated")
          .eq("id", 1)
          .single()

        return NextResponse.json({
          data: data,
          success: true,
          lastUpdated: metaData?.last_updated || new Date().toISOString(),
          source: "supabase",
        })
      } else if (error) {
        console.warn("Supabase query error:", error.message)
      } else {
        console.log("No data found in Supabase")
      }
    } catch (supabaseError) {
      console.error("Error connecting to Supabase:", supabaseError)
    }

    // If Supabase is not available or has no data, return embedded data
    console.log("Falling back to embedded data")
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

    // Try to save to Supabase using server client
    try {
      const supabase = getServerSupabaseClient()
      const now = new Date().toISOString()

      // First, delete all existing data
      const { error: deleteError } = await supabase.from("matrix_data").delete().neq("id", 0)

      if (deleteError) {
        throw new Error(`Delete error: ${deleteError.message}`)
      }

      // Then insert the new data
      const { error: insertError } = await supabase.from("matrix_data").insert(
        body.data.map((row: any, index: number) => ({
          ...row,
          id: index + 1,
        })),
      )

      if (insertError) {
        throw new Error(`Insert error: ${insertError.message}`)
      }

      // Update the last_updated timestamp
      await supabase.from("matrix_metadata").upsert({ id: 1, last_updated: now })

      return NextResponse.json({
        success: true,
        message: "Matrix data saved to Supabase successfully",
        lastUpdated: now,
        source: "supabase",
      })
    } catch (supabaseError) {
      console.error("Failed to save to Supabase:", supabaseError)
      return NextResponse.json({
        success: true,
        message: "Matrix data saved to browser storage only",
        warning: `Failed to save to Supabase: ${supabaseError instanceof Error ? supabaseError.message : "Unknown error"}. Data is only stored in your browser.`,
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
