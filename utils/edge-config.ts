// Edge Config might not be properly initialized, so let's make this more robust
import { createClient } from "@vercel/edge-config"

// Matrix data keys
const MATRIX_DATA_KEY = "matrix_data"
const MATRIX_LAST_UPDATED_KEY = "matrix_last_updated"

// Create Edge Config client with better error handling
let edgeConfig: any = null
try {
  // Check if EDGE_CONFIG environment variable exists
  if (process.env.EDGE_CONFIG) {
    edgeConfig = createClient(process.env.EDGE_CONFIG)
    console.log("Edge Config client initialized with URL")
  } else {
    console.warn("EDGE_CONFIG environment variable is not set")
  }
} catch (error) {
  console.warn("Failed to initialize Edge Config:", error)
}

// Helper function to check if Edge Config is available with improved detection
export async function isEdgeConfigAvailable() {
  if (!edgeConfig) {
    console.warn("Edge Config client not initialized")
    return false
  }

  try {
    // Try a simple operation to check if Edge Config is working
    // Use a timeout to prevent hanging
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Edge Config operation timed out")), 3000),
    )

    const testOperation = edgeConfig.has("test_connection")
    await Promise.race([testOperation, timeout])

    console.log("Edge Config is available and responding")
    return true
  } catch (error) {
    console.warn("Edge Config not available or not responding:", error)
    return false
  }
}

// Helper function to get data from Edge Config
export async function getMatrixDataFromEdgeConfig() {
  if (!edgeConfig) {
    throw new Error("Edge Config not initialized")
  }

  try {
    const data = await edgeConfig.get(MATRIX_DATA_KEY)
    const lastUpdated = await edgeConfig.get(MATRIX_LAST_UPDATED_KEY)

    return {
      data: Array.isArray(data) ? data : [],
      lastUpdated: lastUpdated || null,
      success: true,
      source: "edge_config",
    }
  } catch (error) {
    console.error("Failed to get data from Edge Config:", error)
    throw error
  }
}

// Helper function to save data to Edge Config
export async function saveMatrixDataToEdgeConfig(data: any[]) {
  if (!edgeConfig) {
    throw new Error("Edge Config not initialized")
  }

  try {
    const now = new Date().toISOString()

    // Save both the data and the last updated timestamp
    await edgeConfig.set(MATRIX_DATA_KEY, data)
    await edgeConfig.set(MATRIX_LAST_UPDATED_KEY, now)

    return {
      success: true,
      lastUpdated: now,
      message: "Data saved to Edge Config successfully",
    }
  } catch (error) {
    console.error("Failed to save data to Edge Config:", error)
    throw error
  }
}
