import { createClient } from "@vercel/edge-config"

// Create Edge Config client
export const edgeConfig = createClient(process.env.EDGE_CONFIG)

// Helper function to check if Edge Config is available
export async function isEdgeConfigAvailable() {
  try {
    await edgeConfig.get("test")
    return true
  } catch (error) {
    console.warn("Edge Config not available:", error)
    return false
  }
}
