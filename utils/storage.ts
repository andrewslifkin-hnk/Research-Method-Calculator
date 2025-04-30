// Utility functions for storing and retrieving matrix data

// Storage keys
const MATRIX_DATA_KEY = "feature-matrix-data"
const MATRIX_LAST_UPDATED_KEY = "feature-matrix-last-updated"

// Save matrix data to localStorage
export function saveMatrixData(data: Record<string, string>[]) {
  try {
    localStorage.setItem(MATRIX_DATA_KEY, JSON.stringify(data))
    localStorage.setItem(MATRIX_LAST_UPDATED_KEY, new Date().toISOString())
    return true
  } catch (error) {
    console.error("Failed to save matrix data:", error)
    return false
  }
}

// Load matrix data from localStorage
export function loadMatrixData(): { data: Record<string, string>[]; lastUpdated: string | null } {
  try {
    const dataString = localStorage.getItem(MATRIX_DATA_KEY)
    const lastUpdated = localStorage.getItem(MATRIX_LAST_UPDATED_KEY)

    if (!dataString) {
      return { data: [], lastUpdated: null }
    }

    return {
      data: JSON.parse(dataString),
      lastUpdated,
    }
  } catch (error) {
    console.error("Failed to load matrix data:", error)
    return { data: [], lastUpdated: null }
  }
}

// Check if matrix data exists in localStorage
export function hasMatrixData(): boolean {
  return !!localStorage.getItem(MATRIX_DATA_KEY)
}

// Clear matrix data from localStorage
export function clearMatrixData(): boolean {
  try {
    localStorage.removeItem(MATRIX_DATA_KEY)
    localStorage.removeItem(MATRIX_LAST_UPDATED_KEY)
    return true
  } catch (error) {
    console.error("Failed to clear matrix data:", error)
    return false
  }
}
