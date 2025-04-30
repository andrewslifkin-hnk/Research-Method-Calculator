"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database, Loader2 } from "lucide-react"

export default function SeedDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeedDatabase = async () => {
    if (!confirm("This will replace all existing matrix data with the default data. Are you sure?")) {
      return
    }

    setIsLoading(true)
    setSuccess(null)
    setError(null)

    try {
      const response = await fetch("/api/seed-matrix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(`Database seeded successfully with ${result.rowCount} rows.`)
      } else {
        setError(result.error || "Failed to seed database")
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 text-green-500">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSeedDatabase} disabled={isLoading} variant="outline" className="flex items-center gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
        {isLoading ? "Seeding Database..." : "Seed Database with Default Data"}
      </Button>
    </div>
  )
}
