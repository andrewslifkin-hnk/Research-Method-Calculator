import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const getServerSupabaseClient = () => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  throw new Error("Server Supabase client could not be initialized. Missing environment variables.")
}

export async function POST() {
  try {
    const supabase = getServerSupabaseClient()

    // Try to insert a sample row into matrix_data
    // This will create the table if it doesn't exist
    const { error: dataError } = await supabase.from("matrix_data").upsert([
      {
        id: 1,
        Priority: "Must have",
        Risk: "High",
        Confidence: "No data",
        Data: "No Research",
        Size: "L",
        Timing: "Start",
        Recommendation: "A/B Test",
      },
    ])

    if (dataError) {
      console.error("Error creating matrix_data table:", dataError)
      throw dataError
    }

    // Try to insert a row into matrix_metadata
    // This will create the table if it doesn't exist
    const { error: metaError } = await supabase.from("matrix_metadata").upsert([
      {
        id: 1,
        last_updated: new Date().toISOString(),
      },
    ])

    if (metaError) {
      console.error("Error creating matrix_metadata table:", metaError)
      throw metaError
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error setting up database: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
