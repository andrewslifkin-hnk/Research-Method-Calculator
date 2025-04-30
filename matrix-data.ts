// This file contains the decision matrix data from the API and localStorage

// We'll store the parsed CSV data here
let matrixData: Record<string, string>[] = []
let lastUpdated: string | null = null
let isLoading = true
let loadError: string | null = null
let dataSource: string | null = null

// Event system to notify when matrix data changes
type MatrixDataListener = () => void
const listeners: MatrixDataListener[] = []

// Method descriptions
export const methodDescriptions = {
  "Unmoderated test": "Remote testing without a moderator, allowing users to complete tasks at their own pace",
  "Pre-post analysis": "Comparing metrics before and after a feature launch to measure impact",
  "Monitor with Analytics": "Using analytics tools to track user behavior and feature performance",
  "Exploratory research": "Open-ended research to discover user needs and pain points",
  "UX research & A/B test":
    "In-depth user research combined with comparing two versions of a feature to determine which performs better",
  "Proceed without Testing": "Move forward with implementation without additional research or testing",
}

// EMBEDDED MATRIX DATA - This is the fallback source of truth
// This data will be used if Supabase and localStorage both fail
export const EMBEDDED_MATRIX_DATA = [
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "No data",
    Data: "N/A",
    Size: "L",
    Timing: "Start",
    Recommendation: "UX research & A/B test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Data",
    Size: "L",
    Timing: "Start",
    Recommendation: "UX research & A/B test",
  },
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "L",
    Timing: "Start",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "N/A",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Exploratory research",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Data",
    Size: "M",
    Timing: "Middle",
    Recommendation: "UX research & A/B test",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "No data",
    Data: "N/A",
    Size: "S",
    Timing: "End",
    Recommendation: "Exploratory research",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "End",
    Recommendation: "Unmoderated test",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "S",
    Timing: "End",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "No data",
    Data: "N/A",
    Size: "L",
    Timing: "Start",
    Recommendation: "UX research & A/B test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "L",
    Timing: "Start",
    Recommendation: "UX research & A/B test",
  },
  {
    Priority: "Should have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "L",
    Timing: "Start",
    Recommendation: "Pre-post analysis",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "N/A",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Exploratory research",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Unmoderated test",
  },
  {
    Priority: "Should have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "No data",
    Data: "N/A",
    Size: "S",
    Timing: "End",
    Recommendation: "Exploratory research",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "End",
    Recommendation: "Unmoderated test",
  },
  {
    Priority: "Should have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "S",
    Timing: "End",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "No data",
    Data: "N/A",
    Size: "L",
    Timing: "Start",
    Recommendation: "Exploratory research",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Data",
    Size: "L",
    Timing: "Start",
    Recommendation: "Pre-post analysis",
  },
  {
    Priority: "Nice to have",
    Risk: "High",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "L",
    Timing: "Start",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "No data",
    Data: "N/A",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Exploratory research",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Unmoderated test",
  },
  {
    Priority: "Nice to have",
    Risk: "Medium",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "M",
    Timing: "Middle",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "No data",
    Data: "N/A",
    Size: "S",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Data",
    Size: "S",
    Timing: "End",
    Recommendation: "Monitor with Analytics",
  },
  {
    Priority: "Nice to have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Quantitative data",
    Size: "S",
    Timing: "End",
    Recommendation: "Monitor with Analytics",
  },
]

// Function to fetch matrix data from the API and localStorage
export async function fetchMatrixData() {
  try {
    isLoading = true
    loadError = null

    // Always start with the embedded data to ensure we have something
    matrixData = [...EMBEDDED_MATRIX_DATA]
    lastUpdated = new Date().toISOString()
    dataSource = "embedded_data"

    // Notify listeners of the initial data
    listeners.forEach((listener) => listener())

    // Try to fetch from API first (which will check Supabase)
    try {
      console.log("Fetching matrix data from API...")
      const response = await fetch("/api/matrix", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Don't cache the response
      })

      if (response.ok) {
        // Parse the response with error handling
        try {
          const text = await response.text()
          console.log("API response text (first 100 chars):", text.substring(0, 100))
          const result = JSON.parse(text)

          // If we got data from the API, use it
          if (result.data && result.data.length > 0) {
            matrixData = result.data
            lastUpdated = result.lastUpdated || new Date().toISOString()
            dataSource = result.source || "api"

            // Save to localStorage for offline/future use
            saveMatrixDataToLocalStorage(result.data)

            // Notify all listeners that the data has changed
            listeners.forEach((listener) => listener())

            return {
              success: true,
              data: result.data,
              lastUpdated: result.lastUpdated || new Date().toISOString(),
              source: result.source || "api",
            }
          }
        } catch (jsonError) {
          console.error("Error parsing API response as JSON:", jsonError)
        }
      }
    } catch (apiError) {
      console.warn("API fetch failed, trying localStorage:", apiError)
    }

    // If API fails, try to load from localStorage
    try {
      const localData = loadMatrixDataFromLocalStorage()
      if (localData.data.length > 0) {
        console.log("Using matrix data from localStorage:", localData.data.length, "rows")
        matrixData = localData.data
        lastUpdated = localData.lastUpdated || new Date().toISOString()
        dataSource = "localStorage"

        // Notify listeners of the updated data
        listeners.forEach((listener) => listener())

        return {
          success: true,
          data: localData.data,
          lastUpdated: localData.lastUpdated,
          source: "localStorage",
        }
      }
    } catch (localError) {
      console.warn("Could not load from localStorage, using embedded data:", localError)
    }

    // If we reach here, we're using the embedded data
    console.log("Using embedded matrix data:", EMBEDDED_MATRIX_DATA.length, "rows")

    return {
      success: true,
      data: EMBEDDED_MATRIX_DATA,
      lastUpdated: new Date().toISOString(),
      message: "Using embedded matrix data.",
      source: "embedded_data",
    }
  } catch (error) {
    console.error("Error in fetchMatrixData:", error)
    loadError = error instanceof Error ? error.message : "Unknown error"

    // Always fall back to embedded data
    matrixData = [...EMBEDDED_MATRIX_DATA]
    lastUpdated = new Date().toISOString()
    dataSource = "embedded_data_fallback"

    // Notify listeners
    listeners.forEach((listener) => listener())

    return {
      success: true,
      data: EMBEDDED_MATRIX_DATA,
      lastUpdated: new Date().toISOString(),
      message: "Using embedded data as fallback due to error.",
      source: "embedded_data_fallback",
    }
  } finally {
    isLoading = false
  }
}

// Function to update matrix data via the API and localStorage
export async function updateMatrixData(data: Record<string, string>[]) {
  try {
    // First update localStorage (this should always work)
    saveMatrixDataToLocalStorage(data)

    // Update in-memory data
    matrixData = data
    lastUpdated = new Date().toISOString()
    dataSource = "localStorage"

    // Notify listeners
    listeners.forEach((listener) => listener())

    // Then try to update via API (which will save to Supabase)
    try {
      const response = await fetch("/api/matrix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      })

      if (response.ok) {
        const result = await response.json()

        if (result.source === "supabase") {
          dataSource = "supabase"
          // Notify listeners that the data source has changed
          listeners.forEach((listener) => listener())
        }

        return {
          success: true,
          message: result.message || "Matrix data updated successfully",
          lastUpdated: result.lastUpdated || new Date().toISOString(),
          source: result.source || "api",
        }
      } else {
        const errorText = await response.text()
        throw new Error(`API returned status ${response.status}: ${errorText}`)
      }
    } catch (apiError) {
      console.warn("API error when updating data:", apiError)

      return {
        success: true,
        message: "Matrix data saved to your browser. Server update failed.",
        lastUpdated: new Date().toISOString(),
        warning: `Could not save to server: ${apiError instanceof Error ? apiError.message : "Unknown error"}. Data is only stored in your browser.`,
        source: "localStorage_only",
      }
    }
  } catch (error) {
    console.error("Error updating matrix data:", error)

    return {
      success: false,
      message: "Failed to save matrix data",
      error: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Helper functions for localStorage
function loadMatrixDataFromLocalStorage(): { data: Record<string, string>[]; lastUpdated: string | null } {
  if (typeof window === "undefined") {
    return { data: [], lastUpdated: null }
  }

  try {
    const dataString = localStorage.getItem("feature-matrix-data")
    const lastUpdated = localStorage.getItem("feature-matrix-last-updated")

    if (!dataString) {
      return { data: [], lastUpdated: null }
    }

    return {
      data: JSON.parse(dataString),
      lastUpdated,
    }
  } catch (error) {
    console.error("Failed to load matrix data from localStorage:", error)
    return { data: [], lastUpdated: null }
  }
}

function saveMatrixDataToLocalStorage(data: Record<string, string>[]): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    localStorage.setItem("feature-matrix-data", JSON.stringify(data))
    localStorage.setItem("feature-matrix-last-updated", new Date().toISOString())
    return true
  } catch (error) {
    console.error("Failed to save matrix data to localStorage:", error)
    return false
  }
}

// Function to set the matrix data in memory (for local updates)
export function setMatrixData(data: Record<string, string>[]) {
  console.log("Setting matrix data in matrix-data.ts:", data.length, "rows")

  // Log the first row to help with debugging
  if (data.length > 0) {
    console.log("First row of matrix data:", data[0])
    console.log("Available columns:", Object.keys(data[0]))
  }

  matrixData = data

  // Notify all listeners that the data has changed
  listeners.forEach((listener) => listener())
}

// Function to subscribe to matrix data changes
export function subscribeToMatrixData(listener: MatrixDataListener) {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

// Helper function to find a value in an object with exact key matching
function findValueByKey(obj: Record<string, string>, key: string): string {
  // First try direct match
  if (obj[key] !== undefined) {
    return obj[key]
  }

  // Try case-insensitive match
  const lowerKey = key.toLowerCase()
  for (const objKey of Object.keys(obj)) {
    if (objKey.toLowerCase() === lowerKey) {
      return obj[objKey]
    }
  }

  return ""
}

// Updated getRecommendation function to include data type with conditional logic
export function getRecommendation(
  priority: string,
  risk: string,
  confidence: string,
  data: string, // Added data parameter
  size: string,
  timing: string,
): string[] {
  console.log("Getting recommendation for:", { priority, risk, confidence, data, size, timing })
  console.log("Matrix data has", matrixData.length, "rows")

  if (matrixData.length === 0) {
    return ["No matrix data loaded"]
  }

  // Get the actual column names from the first row
  const sampleRow = matrixData[0]
  const columnNames = Object.keys(sampleRow)

  // Find the actual column names that correspond to our expected columns
  const priorityCol = columnNames.find((col) => col.toLowerCase().includes("priority")) || "Priority"
  const riskCol = columnNames.find((col) => col.toLowerCase().includes("risk")) || "Risk"
  const confidenceCol = columnNames.find((col) => col.toLowerCase().includes("confidence")) || "Confidence"
  const dataCol = columnNames.find((col) => col.toLowerCase() === "data") || "Data" // Added data column
  const sizeCol = columnNames.find((col) => col.toLowerCase().includes("size")) || "Size"
  const timingCol = columnNames.find((col) => col.toLowerCase().includes("timing")) || "Timing"
  const recommendationCol = columnNames.find((col) => col.toLowerCase().includes("recommend")) || "Recommendation"

  console.log("Using columns:", { priorityCol, riskCol, confidenceCol, dataCol, sizeCol, timingCol, recommendationCol })

  // Exact match function - case insensitive but otherwise exact
  const exactMatch = (field1: string, field2: string) => {
    return field1.toLowerCase().trim() === field2.toLowerCase().trim()
  }

  // Handle the special case where confidence is "No data" and data type is "Not Applicable"
  const isNoDataConfidence = confidence.toLowerCase().includes("no data")

  // First try to find an exact match based on all criteria
  const fullMatch = matrixData.find(
    (entry) =>
      exactMatch(entry[priorityCol] || "", priority) &&
      exactMatch(entry[riskCol] || "", risk) &&
      exactMatch(entry[confidenceCol] || "", confidence) &&
      // Skip data matching if confidence is "No data"
      (isNoDataConfidence || exactMatch(entry[dataCol] || "", data)) &&
      exactMatch(entry[sizeCol] || "", size) &&
      exactMatch(entry[timingCol] || "", timing),
  )

  if (fullMatch) {
    const recommendation = fullMatch[recommendationCol]
    if (recommendation) {
      console.log("Found exact full match:", fullMatch)
      return [recommendation]
    }
  }

  // If no full match, try to find a match based on Priority, Risk, and Confidence
  // (and Data if confidence is not "No data")
  const prcMatch = matrixData.find(
    (entry) =>
      exactMatch(entry[priorityCol] || "", priority) &&
      exactMatch(entry[riskCol] || "", risk) &&
      exactMatch(entry[confidenceCol] || "", confidence) &&
      // Skip data matching if confidence is "No data"
      (isNoDataConfidence || exactMatch(entry[dataCol] || "", data)),
  )

  if (prcMatch) {
    const recommendation = prcMatch[recommendationCol]
    if (recommendation) {
      console.log("Found PRCD match:", prcMatch)
      return [recommendation]
    }
  }

  // If no PRCD match, try to find a match based on Size and Timing
  const stMatch = matrixData.find(
    (entry) => exactMatch(entry[sizeCol] || "", size) && exactMatch(entry[timingCol] || "", timing),
  )

  if (stMatch) {
    const recommendation = stMatch[recommendationCol]
    if (recommendation) {
      console.log("Found ST match:", stMatch)
      return [recommendation]
    }
  }

  console.log("No match found, returning default")
  // If no match found, return a default
  return ["No recommendation found"]
}

// Update getUniqueValues to use the actual column names
export function getUniqueValues(column: string): string[] {
  console.log("Getting unique values for column:", column)

  if (matrixData.length === 0) {
    return []
  }

  // Get the actual column names from the first row
  const sampleRow = matrixData[0]
  const columnNames = Object.keys(sampleRow)

  // Find the actual column name that corresponds to our expected column
  const actualColumn = columnNames.find((col) => col.toLowerCase().includes(column.toLowerCase())) || column

  console.log(`Looking for unique values in column "${actualColumn}"`)

  const values = new Set<string>()

  matrixData.forEach((entry) => {
    const value = entry[actualColumn]
    if (value && typeof value === "string") {
      values.add(value.trim())
    }
  })

  const result = Array.from(values)
  console.log(`Found ${result.length} unique values for ${column}:`, result)
  return result
}

// Function to get the raw matrix data
export function getMatrixData() {
  return matrixData
}

// Function to get the loading status
export function getMatrixLoadingStatus() {
  return {
    isLoading,
    loadError,
    lastUpdated,
    dataSource,
  }
}

// Debug function to log the entire matrix
export function debugMatrix() {
  console.log("=== MATRIX DATA DEBUG ===")
  console.log(`Matrix has ${matrixData.length} rows`)
  console.log(`Data source: ${dataSource}`)

  if (matrixData.length > 0) {
    console.log("Column names:", Object.keys(matrixData[0]))

    // Log a few sample rows
    console.log("Sample rows:")
    for (let i = 0; i < Math.min(3, matrixData.length); i++) {
      console.log(`Row ${i}:`, matrixData[i])
    }
  }

  console.log("=== END MATRIX DATA DEBUG ===")
}

// Initialize by loading the embedded data first
matrixData = [...EMBEDDED_MATRIX_DATA]
lastUpdated = new Date().toISOString()
dataSource = "embedded_data"
isLoading = false

// Then try to fetch any updates
fetchMatrixData().catch(console.error)
