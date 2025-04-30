import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key
const getServerSupabaseClient = () => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }
  throw new Error("Server Supabase client could not be initialized. Missing environment variables.")
}

export async function POST(request: Request) {
  try {
    const { data } = await request.json()

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format. Expected an array of matrix data rows.",
        },
        { status: 400 },
      )
    }

    const supabase = getServerSupabaseClient()

    // First, delete all existing data
    const { error: deleteError } = await supabase.from("matrix_data").delete().neq("id", 0)

    if (deleteError) {
      console.error("Error deleting existing data:", deleteError)
      throw deleteError
    }

    // Then insert the new data
    const { error: insertError } = await supabase.from("matrix_data").insert(
      data.map((row: Record<string, string>, index: number) => ({
        ...row,
        id: index + 1, // Add an ID for each row
      })),
    )

    if (insertError) {
      console.error("Error inserting new data:", insertError)
      throw insertError
    }

    // Update the last_updated timestamp in metadata
    const { error: updateError } = await supabase
      .from("matrix_metadata")
      .upsert({ id: 1, last_updated: new Date().toISOString() })

    if (updateError) {
      console.error("Error updating metadata:", updateError)
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: "Matrix data saved successfully",
    })
  } catch (error) {
    console.error("Error saving matrix data:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error saving matrix data: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
