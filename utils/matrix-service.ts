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

  // Provide more detailed error message about which variables are missing
  const missingVars = []
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  
  const errorMsg = `Supabase client could not be initialized. Missing environment variables: ${missingVars.join(", ")}. 
  Make sure to create a .env.local file with these variables.`
  
  // Log to console but don't throw an error
  console.warn(errorMsg)
  
  // Return a dummy client that won't throw errors
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        order: (column: string, { ascending }: { ascending?: boolean } = { ascending: true }) => {
          // Return a Promise-like object that resolves immediately with empty data
          return Promise.resolve({
            data: [],
            error: {
              message: errorMsg
            }
          })
        },
        eq: () => ({
          single: () => Promise.resolve({
            data: null, 
            error: {
              message: errorMsg,
              code: "dummy_error"
            }
          })
        })
      }),
      upsert: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      }),
      insert: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      }),
      delete: () => Promise.resolve({
        data: null,
        error: {
          message: errorMsg
        }
      })
    })
  } as any
}

// Fetch matrix data from API (which uses Supabase server-side)
export async function fetchMatrixData() {
  try {
    // Try to fetch from API first (which will check Supabase server-side)
    console.log("Fetching matrix data from API...")
    const response = await fetch("/api/matrix", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache the response
    })

    if (response.ok) {
      const result = await response.json()
      console.log("API response:", { source: result.source, dataCount: result.data?.length })
      
      if (result.data && result.data.length > 0) {
        return {
          success: true,
          data: result.data,
          lastUpdated: result.lastUpdated || new Date().toISOString(),
          rowCount: result.data.length,
          columnCount: result.data.length > 0 ? Object.keys(result.data[0]).length : 0,
          source: result.source || "api",
        }
      }
    } else {
      console.warn("API request failed:", response.status, response.statusText)
    }

    // If API fails, try to load from localStorage as fallback
    console.log("API failed, trying localStorage...")
    if (typeof window !== "undefined") {
      try {
        const dataString = localStorage.getItem("feature-matrix-data")
        const lastUpdated = localStorage.getItem("feature-matrix-last-updated")

        if (dataString) {
          const data = JSON.parse(dataString)
          console.log("Using data from localStorage:", data.length, "rows")
          return {
            success: true,
            data: data,
            lastUpdated: lastUpdated || new Date().toISOString(),
            rowCount: data.length,
            columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
            source: "localStorage",
          }
        }
      } catch (localError) {
        console.error("Failed to load from localStorage:", localError)
      }
    }

    // Return embedded data as final fallback
    console.log("No localStorage data, using embedded fallback")
    try {
      const embeddedData = require("@/data/matrix-data.json")
      console.log("Using embedded fallback data:", embeddedData.length, "rows")
      return {
        success: true,
        data: embeddedData,
        lastUpdated: new Date().toISOString(),
        rowCount: embeddedData.length,
        columnCount: embeddedData.length > 0 ? Object.keys(embeddedData[0]).length : 0,
        source: "embedded_data_fallback",
        error: "API and localStorage unavailable",
      }
    } catch (embeddedError) {
      console.error("Failed to load embedded data:", embeddedError)
      // Return an empty dataset as last resort
      return {
        success: false,
        data: [],
        lastUpdated: new Date().toISOString(),
        rowCount: 0,
        columnCount: 0,
        source: "empty_fallback",
        error: "All data sources failed. No matrix data available.",
      }
    }
  } catch (unexpectedError) {
    // This catch handles any unexpected errors in our code
    console.error("Unexpected error in fetchMatrixData:", unexpectedError)
    
    // Return embedded data as final fallback for unexpected errors
    try {
      const embeddedData = require("@/data/matrix-data.json")
      console.log("Using embedded fallback data after unexpected error:", embeddedData.length, "rows")
      return {
        success: true,
        data: embeddedData,
        lastUpdated: new Date().toISOString(),
        rowCount: embeddedData.length,
        columnCount: embeddedData.length > 0 ? Object.keys(embeddedData[0]).length : 0,
        source: "embedded_data_fallback",
        error: unexpectedError instanceof Error ? unexpectedError.message : "Unknown error",
      }
    } catch (embeddedError) {
      // Return an empty dataset as absolute last resort
      return {
        success: false,
        data: [],
        lastUpdated: new Date().toISOString(),
        rowCount: 0,
        columnCount: 0,
        source: "empty_fallback",
        error: "All data sources failed. No matrix data available.",
      }
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
