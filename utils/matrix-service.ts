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

// Fetch matrix data from Supabase
export async function fetchMatrixData() {
  try {
    const supabase = getSupabaseClient()

    // Get the matrix data
    const { data, error } = await supabase.from("matrix_data").select("*").order("id", { ascending: true })

    if (error) throw error

    // Calculate metadata
    const rowCount = data?.length || 0
    const columnCount = data && data.length > 0 ? Object.keys(data[0]).length : 0

    return {
      success: true,
      data: data || [],
      lastUpdated: new Date().toISOString(),
      rowCount,
      columnCount,
      source: "supabase",
    }
  } catch (error) {
    console.error("Failed to fetch matrix data:", error)

    // Try to load from localStorage as fallback
    try {
      if (typeof window !== "undefined") {
        const dataString = localStorage.getItem("feature-matrix-data")
        const lastUpdated = localStorage.getItem("feature-matrix-last-updated")

        if (dataString) {
          const data = JSON.parse(dataString)
          return {
            success: true,
            data: data,
            lastUpdated: lastUpdated || new Date().toISOString(),
            rowCount: data.length,
            columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
            source: "localStorage",
          }
        }
      }
    } catch (localError) {
      console.error("Failed to load from localStorage:", localError)
    }

    // Return embedded data as final fallback
    const embeddedData = require("@/data/matrix-data.json")
    return {
      success: true,
      data: embeddedData,
      lastUpdated: new Date().toISOString(),
      rowCount: embeddedData.length,
      columnCount: embeddedData.length > 0 ? Object.keys(embeddedData[0]).length : 0,
      source: "embedded_data_fallback",
      error: `Failed to fetch matrix data: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Save matrix data to Supabase - this needs to be done server-side to bypass RLS
export async function saveMatrixData(data: MatrixDataRow[]) {
  try {
    // We need to make a server-side request to bypass RLS
    const response = await fetch("/api/save-matrix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to save matrix data")
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Failed to save matrix data:", error)
    return {
      success: false,
      error: `Failed to save matrix data: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Get unique values for a specific column
export function getUniqueValues(data: MatrixDataRow[], column: string): string[] {
  const values = new Set<string>()

  data.forEach((row) => {
    // Handle case-insensitive column matching
    const actualColumn = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase()) || column

    if (row[actualColumn]) {
      values.add(row[actualColumn].trim())
    }
  })

  return Array.from(values)
}

// Get recommendation based on feature attributes
export function getRecommendation(
  data: MatrixDataRow[],
  priority: string,
  risk: string,
  confidence: string,
  dataType: string,
  size: string,
  timing: string,
): string[] {
  // Case-insensitive exact match function
  const exactMatch = (field1: string, field2: string) => {
    return field1.toLowerCase().trim() === field2.toLowerCase().trim()
  }

  // Handle special case where confidence is "No data"
  const isNoDataConfidence = confidence.toLowerCase().includes("no data")

  // Try to find an exact match based on all criteria
  const fullMatch = data.find(
    (row) =>
      exactMatch(row.Priority || "", priority) &&
      exactMatch(row.Risk || "", risk) &&
      exactMatch(row.Confidence || "", confidence) &&
      (isNoDataConfidence || exactMatch(row.Data || "", dataType)) &&
      exactMatch(row.Size || "", size) &&
      exactMatch(row.Timing || "", timing),
  )

  if (fullMatch) {
    return [fullMatch.Recommendation]
  }

  // If no full match, try to find a match based on Priority, Risk, and Confidence
  const prcMatch = data.find(
    (row) =>
      exactMatch(row.Priority || "", priority) &&
      exactMatch(row.Risk || "", risk) &&
      exactMatch(row.Confidence || "", confidence),
  )

  if (prcMatch) {
    return [prcMatch.Recommendation]
  }

  // If no PRC match, try to find a match based on Size and Timing
  const stMatch = data.find((row) => exactMatch(row.Size || "", size) && exactMatch(row.Timing || "", timing))

  if (stMatch) {
    return [stMatch.Recommendation]
  }

  // If no match found, return a default
  return ["No recommendation found"]
}
