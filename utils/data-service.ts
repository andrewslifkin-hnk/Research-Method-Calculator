// Utility functions for fetching matrix data from Supabase
import { EMBEDDED_MATRIX_DATA } from "@/matrix-data"
import {
  getMatrixDataFromSupabase,
  isSupabaseAvailable,
  saveMatrixDataToSupabase,
  type MatrixDataRow,
} from "./supabase"

/**
 * Fetches the matrix data from Supabase or falls back to localStorage/embedded data
 */
export async function fetchMatrixData() {
  try {
    // Check if Supabase is available
    const supabaseAvailable = await isSupabaseAvailable().catch(() => false)

    if (supabaseAvailable) {
      try {
        // Get data from Supabase
        const result = await getMatrixDataFromSupabase()

        // If we have data from Supabase, use it
        if (result.data && result.data.length > 0) {
          console.log("Using Supabase data:", result.data.length, "rows")

          // Save to localStorage for offline use
          if (typeof window !== "undefined") {
            localStorage.setItem("feature-matrix-data", JSON.stringify(result.data))
            localStorage.setItem("feature-matrix-last-updated", result.lastUpdated)
          }

          return result
        }
      } catch (supabaseError) {
        console.error("Error fetching from Supabase:", supabaseError)
        // Continue to fallback options
      }
    }

    // If Supabase is not available or has no data, try localStorage
    if (typeof window !== "undefined") {
      try {
        const localData = getLocalStorageData()

        // If we have local data, use it
        if (localData && localData.data && localData.data.length > 0) {
          console.log("Using local storage data:", localData.data.length, "rows")
          return localData
        }
      } catch (localError) {
        console.warn("Error reading from localStorage:", localError)
        // Continue to embedded data
      }
    }

    // If all else fails, use embedded data
    console.log("Using embedded matrix data:", EMBEDDED_MATRIX_DATA.length, "rows")
    return {
      data: EMBEDDED_MATRIX_DATA,
      success: true,
      message: "Using embedded data as no other data source is available",
      lastUpdated: new Date().toISOString(),
      source: "embedded_data",
    }
  } catch (error) {
    console.error("Error fetching matrix data:", error)

    // Use embedded data as last resort
    return {
      data: EMBEDDED_MATRIX_DATA,
      success: true,
      message: "Using embedded data as fallback due to error",
      lastUpdated: new Date().toISOString(),
      source: "embedded_data_error_fallback",
    }
  }
}

/**
 * Updates the matrix data via Supabase or falls back to localStorage
 */
export async function updateMatrixData(data: MatrixDataRow[]) {
  try {
    // Save to localStorage first for guaranteed persistence
    saveToLocalStorage(data, new Date().toISOString())

    // Try to save to Supabase
    const supabaseAvailable = await isSupabaseAvailable().catch(() => false)

    if (supabaseAvailable) {
      try {
        const result = await saveMatrixDataToSupabase(data)
        return {
          success: true,
          message: "Data saved to Supabase successfully",
          lastUpdated: result.lastUpdated,
          source: "supabase",
        }
      } catch (supabaseError) {
        console.error("Failed to save to Supabase:", supabaseError)
        return {
          success: true,
          message: "Data saved to browser storage only",
          warning: `Failed to save to Supabase: ${supabaseError instanceof Error ? supabaseError.message : "Unknown error"}. Data is only stored in your browser.`,
          lastUpdated: new Date().toISOString(),
          source: "localStorage_only",
        }
      }
    } else {
      return {
        success: true,
        message: "Data saved to browser storage only",
        warning: "Supabase is not available. Data is only stored in your browser.",
        lastUpdated: new Date().toISOString(),
        source: "localStorage_only",
      }
    }
  } catch (error) {
    console.error("Error updating matrix data:", error)
    return {
      success: false,
      message: "Failed to save data",
      error: String(error),
    }
  }
}

// Helper functions for localStorage
function getLocalStorageData() {
  if (typeof window === "undefined") return null

  try {
    const dataString = localStorage.getItem("feature-matrix-data")
    const lastUpdated = localStorage.getItem("feature-matrix-last-updated")

    if (!dataString) return null

    return {
      data: JSON.parse(dataString),
      lastUpdated,
      success: true,
      source: "localStorage",
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error)
    return null
  }
}

function saveToLocalStorage(data: MatrixDataRow[], lastUpdated: string) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("feature-matrix-data", JSON.stringify(data))
    localStorage.setItem("feature-matrix-last-updated", lastUpdated)
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}
