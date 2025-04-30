import { NextResponse } from "next/server"
import { isEdgeConfigAvailable } from "@/utils/edge-config"

export async function GET() {
  try {
    // Check if Edge Config is available
    const available = await isEdgeConfigAvailable()

    // Get environment info
    const envInfo = {
      hasEdgeConfigVar: !!process.env.EDGE_CONFIG,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }

    return NextResponse.json({
      edgeConfigAvailable: available,
      environment: envInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: `Error checking Edge Config: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
