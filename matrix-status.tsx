"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, AlertCircle, Settings, RefreshCw, HardDrive, FileText, Database } from "lucide-react"
import { fetchMatrixData } from "@/utils/data-service"
import { isSupabaseAvailable } from "@/utils/supabase"
import { useRouter } from "next/navigation"

export default function MatrixStatus() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string | null>("embedded_data")
  const [supabaseAvailable, setSupabaseAvailable] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is available
    isSupabaseAvailable()
      .then((available) => {
        setSupabaseAvailable(available)
      })
      .catch((err) => {
        console.error("Error checking Supabase availability:", err)
        setSupabaseAvailable(false)
      })

    // Try to fetch the data to get the latest version
    fetchMatrixData()
      .then((result) => {
        if (result.success) {
          setLastUpdated(result.lastUpdated)
          setDataSource(result.source || "embedded_data")
          setError(null)
        } else {
          setError(result.error || "Failed to load matrix data")
        }
      })
      .catch((err) => {
        setError("An unexpected error occurred")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // Check Supabase availability again
      const available = await isSupabaseAvailable().catch(() => false)
      setSupabaseAvailable(available)

      const result = await fetchMatrixData()
      if (result.success) {
        setLastUpdated(result.lastUpdated)
        setDataSource(result.source || "embedded_data")
        setError(null)
      } else {
        setError(result.error || "Failed to refresh matrix data")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const goToAdminPage = () => {
    router.push("/admin/matrix")
  }

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Loading matrix...
      </Badge>
    )
  }

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-current" />
                Matrix error
              </Badge>
              <Button onClick={handleRefresh} variant="ghost" size="icon" className="h-6 w-6">
                <RefreshCw className="h-3 w-3 text-current" />
                <span className="sr-only">Refresh</span>
              </Button>
              <Button onClick={goToAdminPage} variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3 text-current" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error || "Failed to load matrix data. Click to refresh or access admin settings."}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const getSourceIcon = () => {
    if (dataSource === "embedded_data" || dataSource === "embedded_data_fallback")
      return <FileText className="h-3 w-3 text-current" />
    if (dataSource === "localStorage") return <HardDrive className="h-3 w-3 text-current" />
    if (dataSource === "supabase") return <Database className="h-3 w-3 text-current" />
    return <CheckCircle className="h-3 w-3 text-current" />
  }

  const getSourceText = () => {
    if (dataSource === "embedded_data" || dataSource === "embedded_data_fallback") return "Standard Matrix"
    if (dataSource === "localStorage") return "Browser Storage"
    if (dataSource === "supabase") return "Supabase Database"
    return "Matrix loaded"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={`${
                dataSource === "supabase"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              } flex items-center gap-1`}
            >
              {getSourceIcon()}
              {getSourceText()}
            </Badge>
            <Button onClick={handleRefresh} variant="ghost" size="icon" className="h-6 w-6 text-gray-500">
              <RefreshCw className="h-3 w-3" />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button onClick={goToAdminPage} variant="ghost" size="icon" className="h-6 w-6 text-gray-500">
              <Settings className="h-3 w-3" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Decision matrix loaded from {getSourceText()}.{" "}
            {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleString()}`}
            {supabaseAvailable ? " Supabase is available." : " Supabase is not available."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
