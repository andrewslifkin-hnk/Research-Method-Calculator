"use client"

import { useAuth } from "@/contexts/auth-context"
import AdminLogin from "@/components/admin-login"
import CSVUploader from "@/csv-uploader"
import SetupDatabase from "@/setup-database"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Add a current data status component to the main admin page
// First, import the necessary components at the top of the file

import { useState, useEffect } from "react"
import { fetchMatrixData } from "@/utils/matrix-service"
import { Database, HardDrive, FileText, Info, RefreshCw } from "lucide-react"

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth()

  // Add state variables and useEffect to fetch matrix data info
  // Add this right after the useAuth line in the AdminPage component

  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rowCount, setRowCount] = useState<number | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadMatrixInfo()
    }
  }, [isAuthenticated])

  const loadMatrixInfo = async () => {
    setIsLoading(true)
    try {
      const result = await fetchMatrixData()
      if (result.success) {
        setLastUpdated(result.lastUpdated || null)
        setDataSource(result.source || null)
        setRowCount(result.data?.length || null)
      }
    } catch (err) {
      console.error("Error fetching matrix data info:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4 max-w-md">
          <div className="mb-6">
            <Link href="/">
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Feature Analysis
              </Button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center">Admin Access</h1>
          <AdminLogin />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Feature Analysis
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">Matrix Data Administration</h1>
        <p className="text-muted-foreground mb-8">
          Upload and manage the decision matrix data that will be used by all users of the application.
        </p>

        {/* Add the current data status card to the admin page
        Add this right after the h1 and p elements in the authenticated return statement */}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Current Matrix Data Status
            </CardTitle>
            <CardDescription>Information about the currently active decision matrix data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data Source</h3>
                <div className="flex items-center gap-2">
                  {dataSource === "supabase" ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <Database className="h-4 w-4" /> Supabase Database
                    </span>
                  ) : dataSource === "localStorage" ? (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <HardDrive className="h-4 w-4" /> Browser Storage
                    </span>
                  ) : dataSource === "embedded_data" || dataSource === "embedded_data_fallback" ? (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <FileText className="h-4 w-4" /> Embedded Default Data
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-600 font-medium">
                      <Info className="h-4 w-4" /> Unknown Source
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                <p className="font-medium">{lastUpdated ? new Date(lastUpdated).toLocaleString() : "Unknown"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data Size</h3>
                <p className="font-medium">{rowCount !== null ? `${rowCount} rows` : "Unknown"}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="mt-4" onClick={loadMatrixInfo} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Matrix Data Information
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>
                Set up the database tables required for storing the matrix data. Run this once before uploading data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SetupDatabase />
            </CardContent>
          </Card>

          <CSVUploader />
        </div>
      </div>
    </main>
  )
}
