import { createClient } from "@supabase/supabase-js"

// Type for our matrix data
export type MatrixDataRow = Record<string, string>

// Create a single instance of the Supabase client for the browser
let supabaseClient: ReturnType<typeof createClient> | null = null

// Initialize the Supabase client (client-side)
export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  // Check if we're in a browser environment and have the necessary env vars
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return supabaseClient
  }

  throw new Error("Supabase client could not be initialized. Missing environment variables.")
}

// Create a server-side Supabase client (for API routes)
export const getServerSupabaseClient = () => {
  // For server-side, we create a new client each time to avoid sharing state
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  }

  throw new Error("Server Supabase client could not be initialized. Missing environment variables.")
}

// Check if Supabase is available
export async function isSupabaseAvailable() {
  try {
    const supabase = getSupabaseClient()
    // Try a simple query to check if Supabase is working
    const { error } = await supabase.from("matrix_data").select("count", { count: "exact", head: true })

    if (error) {
      console.warn("Supabase not available:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.warn("Error checking Supabase availability:", error)
    return false
  }
}

// Helper function to get matrix data from Supabase
export async function getMatrixDataFromSupabase() {
  try {
    const supabase = getSupabaseClient()

    // Get the matrix data
    const { data, error } = await supabase.from("matrix_data").select("*").order("id", { ascending: true })

    if (error) throw error

    // Get the last updated timestamp
    const { data: metaData, error: metaError } = await supabase
      .from("matrix_metadata")
      .select("last_updated")
      .eq("id", 1)
      .single()

    if (metaError && metaError.code !== "PGRST116") throw metaError

    return {
      data: data || [],
      lastUpdated: metaData?.last_updated || new Date().toISOString(),
      success: true,
      source: "supabase",
    }
  } catch (error) {
    console.error("Failed to get data from Supabase:", error)
    throw error
  }
}

// Helper function to save matrix data to Supabase
export async function saveMatrixDataToSupabase(data: MatrixDataRow[]) {
  try {
    const supabase = getServerSupabaseClient()
    const now = new Date().toISOString()

    // Begin a transaction
    // First, delete all existing data
    const { error: deleteError } = await supabase.from("matrix_data").delete().neq("id", 0) // Ensure we have a condition to avoid deleting everything by accident

    if (deleteError) throw deleteError

    // Then insert the new data
    const { error: insertError } = await supabase.from("matrix_data").insert(
      data.map((row, index) => ({
        ...row,
        id: index + 1, // Add an ID for each row
      })),
    )

    if (insertError) throw insertError

    // Update the last_updated timestamp
    const { error: updateError } = await supabase.from("matrix_metadata").upsert({ id: 1, last_updated: now })

    if (updateError) throw updateError

    return {
      success: true,
      lastUpdated: now,
      message: "Data saved to Supabase successfully",
    }
  } catch (error) {
    console.error("Failed to save data to Supabase:", error)
    throw error
  }
}
