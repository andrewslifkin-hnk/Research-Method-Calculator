"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  Save,
  Upload,
  FileText,
  Eye,
  Home,
  Database,
  Check,
  RefreshCw,
  Info,
  Download,
  HardDrive,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { parseCSV } from "@/utils/csv-parser"
import { fetchMatrixData, setMatrixData, EMBEDDED_MATRIX_DATA, updateMatrixData } from "@/matrix-data"
import { isSupabaseAvailable } from "@/utils/supabase"
import { SharedDataNotice } from "../app/admin/shared-data-notice"
import SeedDatabase from "../app/admin/matrix/seed-database"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type Step = "upload" | "preview" | "save" | "success"

export default function MatrixAdminContent() {
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [csvData, setCsvData] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadMethod, setUploadMethod] = useState<"file" | "sample" | "paste" | "embedded" | "url" | null>(null)
  const [csvUrl, setCsvUrl] = useState<string>("")
  const [supabaseAvailable, setSupabaseAvailable] = useState<boolean>(false)
  const [dataSource, setDataSource] = useState<string | null>(null)
  const [showMatrixDialog, setShowMatrixDialog] = useState(false)
  const [currentMatrixData, setCurrentMatrixData] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is available with retry logic
    const checkSupabase = async (retries = 3) => {
      try {
        const available = await isSupabaseAvailable()
        setSupabaseAvailable(available)

        if (!available && retries > 0) {
          console.log(`Supabase not available, retrying... (${retries} attempts left)`)
          setTimeout(() => checkSupabase(retries - 1), 2000)
        }
      } catch (err) {
        console.error("Error checking Supabase:", err)
        setSupabaseAvailable(false)
      }
    }

    checkSupabase()

    // Fetch current matrix data
    fetchMatrixData()
      .then((result) => {
        if (result.success) {
          setLastUpdated(result.lastUpdated || null)
          setDataSource(result.source || null)
          setCurrentMatrixData(result.data || [])
        }
      })
      .catch((err) => {
        console.error("Error fetching matrix data:", err)
      })
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(null)
    setWarning(null)
    setIsLoading(true)
    setProgress(10)

    const file = event.target.files?.[0]
    if (!file) {
      setError("No file selected")
      setIsLoading(false)
      return
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please select a CSV file")
      setIsLoading(false)
      return
    }

    setProgress(30)
    const reader = new FileReader()
    reader.onload = (e) => {
      setProgress(60)
      const content = e.target?.result as string
      setCsvData(content)
      setProgress(80)

      try {
        const result = parseCSV(content)
        setParsedData(result)
        setProgress(100)
        setCurrentStep("preview")
        setIsLoading(false)
      } catch (err) {
        setError(`Failed to parse CSV: ${err instanceof Error ? err.message : "Unknown error"}`)
        setIsLoading(false)
      }
    }
    reader.onerror = () => {
      setError("Failed to read the file")
      setIsLoading(false)
    }
    reader.readAsText(file)
  }

  const handleUrlUpload = async () => {
    if (!csvUrl.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setError(null)
    setSuccess(null)
    setWarning(null)
    setIsLoading(true)
    setProgress(10)

    try {
      // Fetch the CSV from the URL
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
      }

      setProgress(40)
      const content = await response.text()
      setCsvData(content)
      setProgress(70)

      try {
        const result = parseCSV(content)
        setParsedData(result)
        setProgress(100)
        setCurrentStep("preview")
        setIsLoading(false)
        setSuccess("CSV file loaded successfully from URL")
      } catch (err) {
        setError(`Failed to parse CSV: ${err instanceof Error ? err.message : "Unknown error"}`)
        setIsLoading(false)
      }
    } catch (err) {
      setError(`Failed to fetch CSV from URL: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  const loadSampleCSV = () => {
    setError(null)
    setSuccess(null)
    setWarning(null)
    setIsLoading(true)
    setProgress(20)

    // Sample CSV data
    const SAMPLE_CSV = `Priority,Risk,Confidence,Size,Timing,Recommendation
Must have,High,No data,Large,Quarter start,UX research & A/B test
Must have,High,Inconclusive data,Large,Quarter start,UX research & A/B test
Must have,High,Conclusive data,Large,Quarter start,Monitor with Analytics
Must have,Medium,No data,Medium,Quarter half,Exploratory research
Must have,Medium,Inconclusive data,Medium,Quarter half,UX research & A/B test
Must have,Medium,Conclusive data,Medium,Quarter half,Monitor with Analytics
Must have,Low,No data,Small,Quarter end,Exploratory research
Must have,Low,Inconclusive data,Small,Quarter end,Unmoderated test
Must have,Low,Conclusive data,Small,Quarter end,Monitor with Analytics
Should have,High,No data,Large,Quarter start,UX research & A/B test
Should have,High,Inconclusive data,Large,Quarter start,UX research & A/B test
Should have,High,Conclusive data,Large,Quarter start,Pre-post analysis
Should have,Medium,No data,Medium,Quarter half,Exploratory research
Should have,Medium,Inconclusive data,Medium,Quarter half,Unmoderated test
Should have,Medium,Conclusive data,Medium,Quarter half,Monitor with Analytics
Should have,Low,No data,Small,Quarter end,Exploratory research
Should have,Low,Inconclusive data,Small,Quarter end,Unmoderated test
Should have,Low,Conclusive data,Small,Quarter end,Monitor with Analytics
Nice to have,High,No data,Large,Quarter start,Exploratory research
Nice to have,High,Inconclusive data,Large,Quarter start,Pre-post analysis
Nice to have,High,Conclusive data,Large,Quarter start,Monitor with Analytics
Nice to have,Medium,No data,Medium,Quarter half,Exploratory research
Nice to have,Medium,Inconclusive data,Medium,Quarter half,Unmoderated test
Nice to have,Medium,Conclusive data,Medium,Quarter half,Monitor with Analytics
Nice to have,Low,No data,Small,Quarter end,Monitor with Analytics
Nice to have,Low,Inconclusive data,Small,Quarter end,Monitor with Analytics
Nice to have,Low,Conclusive data,Small,Quarter end,Monitor with Analytics`

    setCsvData(SAMPLE_CSV)

    setTimeout(() => {
      setProgress(60)
      try {
        const result = parseCSV(SAMPLE_CSV)
        setParsedData(result)
        setProgress(100)
        setCurrentStep("preview")
        setIsLoading(false)
      } catch (err) {
        setError(`Failed to parse sample CSV: ${err instanceof Error ? err.message : "Unknown error"}`)
        setIsLoading(false)
      }
    }, 500)
  }

  const loadEmbeddedData = () => {
    setError(null)
    setSuccess(null)
    setWarning(null)
    setIsLoading(true)
    setProgress(20)

    setTimeout(() => {
      setProgress(60)
      try {
        setParsedData(EMBEDDED_MATRIX_DATA)
        setProgress(100)
        setCurrentStep("preview")
        setIsLoading(false)
        setSuccess("Loaded embedded matrix data. This is the standard data built into the application.")
      } catch (err) {
        setError(`Failed to load embedded data: ${err instanceof Error ? err.message : "Unknown error"}`)
        setIsLoading(false)
      }
    }, 500)
  }

  const handlePasteCSV = () => {
    setError(null)
    setSuccess(null)
    setWarning(null)

    if (!csvData.trim()) {
      setError("Please paste CSV data first")
      return
    }

    setIsLoading(true)
    setProgress(30)

    setTimeout(() => {
      setProgress(70)
      try {
        const result = parseCSV(csvData)
        if (result.length === 0) {
          setError("No valid data found in CSV")
          setIsLoading(false)
          return
        }

        setParsedData(result)
        setProgress(100)
        setCurrentStep("preview")
        setIsLoading(false)
      } catch (err) {
        setError(`Failed to parse CSV: ${err instanceof Error ? err.message : "Unknown error"}`)
        setIsLoading(false)
      }
    }, 500)
  }

  const handleSaveMatrix = async () => {
    setError(null)
    setSuccess(null)
    setWarning(null)
    setIsLoading(true)
    setProgress(20)

    // Set the matrix data in memory
    setMatrixData(parsedData)
    setProgress(40)

    try {
      // Save to Supabase and localStorage
      const result = await updateMatrixData(parsedData)
      setProgress(100)

      if (result.success) {
        setCurrentStep("success")
        setLastUpdated(result.lastUpdated || new Date().toISOString())
        setDataSource(result.source || "localStorage")

        // Show success message
        setSuccess(result.message || "Matrix data saved successfully")

        // Show warning if there is one
        if (result.warning) {
          setWarning(result.warning)
        }
      } else {
        setError(result.message || "Failed to save matrix data")
      }
    } catch (err) {
      console.error("Error saving matrix data:", err)
      setError(`Error saving matrix data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshMatrixData = async () => {
    setError(null)
    setSuccess(null)
    setWarning(null)
    setIsLoading(true)
    setProgress(30)

    try {
      // Check Supabase availability again
      const available = await isSupabaseAvailable().catch(() => false)
      setSupabaseAvailable(available)

      const result = await fetchMatrixData()
      setProgress(100)

      if (result.success) {
        setSuccess("Matrix data refreshed successfully")
        setLastUpdated(result.lastUpdated || null)
        setDataSource(result.source || null)
        setCurrentMatrixData(result.data || [])

        // If we have data, set it to the parsed data for preview
        if (result.data && result.data.length > 0) {
          setParsedData(result.data)
          setCurrentStep("preview")
        }

        // Check if there's a warning message
        if (result.message) {
          setWarning(result.message)
        }
      } else {
        setError(result.error || "Failed to refresh matrix data")
      }
    } catch (err) {
      setError(`Error refreshing matrix data: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (parsedData.length === 0) {
      setError("No data to export")
      return
    }

    try {
      // Get the headers from the first row
      const headers = Object.keys(parsedData[0])

      // Create CSV content
      let csvContent = headers.join(",") + "\n"

      // Add each row
      parsedData.forEach((row) => {
        const rowValues = headers.map((header) => {
          // Wrap values in quotes if they contain commas
          const value = row[header] || ""
          return value.includes(",") ? `"${value}"` : value
        })
        csvContent += rowValues.join(",") + "\n"
      })

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `matrix-data-${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setSuccess("CSV exported successfully")
    } catch (err) {
      setError(`Failed to export CSV: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const handleGoToApp = () => {
    router.push("/")
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleViewCurrentMatrix = () => {
    setIsLoading(true)
    fetchMatrixData()
      .then((result) => {
        setCurrentMatrixData(result.data || [])
        setShowMatrixDialog(true)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching matrix data:", err)
        setError("Error loading current matrix data")
        setIsLoading(false)
      })
  }

  const renderStepIndicator = () => {
    const steps = ["upload", "preview", "save", "success"]
    const currentIndex = steps.indexOf(currentStep)

    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${index <= currentIndex ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center border ${
                  index < currentIndex
                    ? "bg-primary text-white border-primary"
                    : index === currentIndex
                      ? "border-primary text-primary"
                      : "border-muted-foreground"
                }`}
              >
                {index < currentIndex ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>
              <span className="ml-2 hidden sm:inline">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
            </div>
          ))}
        </div>
        <Progress value={(currentIndex / (steps.length - 1)) * 100} className="h-2" />
      </div>
    )
  }

  const renderUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Matrix Data
        </CardTitle>
        <CardDescription>
          Choose a method to upload your decision matrix data
          {lastUpdated && (
            <span className="block mt-1 text-sm">Last updated: {new Date(lastUpdated).toLocaleString()}</span>
          )}
          {dataSource && (
            <span className="block mt-1 text-sm">
              Current data source:{" "}
              {dataSource === "supabase"
                ? "Supabase Database"
                : dataSource === "localStorage"
                  ? "Browser Storage"
                  : dataSource === "embedded_data"
                    ? "Embedded Data"
                    : dataSource}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {warning && (
          <Alert className="border-amber-500 bg-amber-50">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700">Note</AlertTitle>
            <AlertDescription className="text-amber-700">{warning}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Alert className={supabaseAvailable ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
          <Info className={`h-4 w-4 ${supabaseAvailable ? "text-green-600" : "text-amber-600"}`} />
          <AlertTitle className={supabaseAvailable ? "text-green-700" : "text-amber-700"}>
            {supabaseAvailable ? "Supabase Available" : "Supabase Not Available"}
          </AlertTitle>
          <AlertDescription className={supabaseAvailable ? "text-green-700" : "text-amber-700"}>
            {supabaseAvailable
              ? "Supabase is available. Matrix data will be stored persistently in the database and shared across all users."
              : "Supabase is not available. Matrix data will only be stored in browser storage and will not be shared across users."}
          </AlertDescription>
        </Alert>

        {supabaseAvailable && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Database Management</h3>
            <p className="text-muted-foreground mb-4">
              You can seed the database with the default matrix data or reset it to its initial state.
            </p>
            <div className="flex flex-col space-y-4">
              <SeedDatabase />
              <Button 
                variant="outline" 
                onClick={handleViewCurrentMatrix}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Current Matrix Data
              </Button>
            </div>
          </div>
        )}

        {!supabaseAvailable && (
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Local Matrix Data</h3>
            <p className="text-muted-foreground mb-4">
              Supabase is not available. Matrix data is stored locally only.
            </p>
            <Button 
              variant="outline" 
              onClick={handleViewCurrentMatrix}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Current Matrix Data
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium mb-2">Processing your data</h3>
              <p className="text-muted-foreground">Please wait while we process your data...</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="file" onClick={() => setUploadMethod("file")}>
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url" onClick={() => setUploadMethod("url")}>
                From URL
              </TabsTrigger>
              <TabsTrigger value="paste" onClick={() => setUploadMethod("paste")}>
                Paste CSV
              </TabsTrigger>
              <TabsTrigger value="sample" onClick={() => setUploadMethod("sample")}>
                Use Sample
              </TabsTrigger>
              <TabsTrigger value="embedded" onClick={() => setUploadMethod("embedded")}>
                Standard Data
              </TabsTrigger>
              <TabsTrigger value="current" onClick={() => setUploadMethod(null)}>
                Current Data
              </TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="space-y-4 pt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                <p className="text-muted-foreground mb-4">Drag and drop your CSV file here, or click to browse</p>
                <Button onClick={triggerFileInput} variant="outline" className="mx-auto">
                  Select CSV File
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Load CSV from URL</h3>
                <p className="text-muted-foreground mb-2">Enter the URL of a CSV file to load</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/matrix-data.csv"
                    value={csvUrl}
                    onChange={(e) => setCsvUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleUrlUpload}>Load URL</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="paste" className="space-y-4 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Paste CSV Data</h3>
                <p className="text-muted-foreground mb-2">Copy and paste your CSV data in the text area below</p>
                <textarea
                  className="w-full min-h-[200px] p-3 border rounded-md"
                  placeholder="Paste CSV data here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                  <Button onClick={handlePasteCSV}>Process CSV Data</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="sample" className="space-y-4 pt-4">
              <div className="border rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Use Sample Data</h3>
                <p className="text-muted-foreground mb-4">
                  Load our sample decision matrix data to get started quickly
                </p>
                <Button onClick={loadSampleCSV} className="mx-auto">
                  Load Sample Data
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="embedded" className="space-y-4 pt-4">
              <div className="border rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Use Standard Matrix Data</h3>
                <p className="text-muted-foreground mb-4">
                  Load the standard matrix data that's embedded in the application
                </p>
                <Button onClick={loadEmbeddedData} className="mx-auto">
                  Load Standard Data
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="current" className="space-y-4 pt-4">
              <div className="border rounded-lg p-8 text-center">
                <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Use Current Data</h3>
                <p className="text-muted-foreground mb-4">View and edit the current matrix data</p>
                <Button onClick={handleRefreshMatrixData} className="mx-auto flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Load Current Data
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="secondary" onClick={handleGoToApp}>
          <Home className="h-4 w-4 mr-2" />
          Return to App
        </Button>
      </CardFooter>
    </Card>
  )

  const renderPreviewStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview Matrix Data
        </CardTitle>
        <CardDescription>Review the data before saving it</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {warning && (
          <Alert className="border-amber-500 bg-amber-50">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700">Note</AlertTitle>
            <AlertDescription className="text-amber-700">{warning}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Data Preview</h3>
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground">{parsedData.length} rows found</span>
              <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {parsedData.length > 0 &&
                    Object.keys(parsedData[0]).map((column) => <TableHead key={column}>{column}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {Object.keys(parsedData[0]).map((column) => (
                      <TableCell key={column}>{row[column]}</TableCell>
                    ))}
                  </TableRow>
                ))}
                {parsedData.length > 10 && (
                  <TableRow>
                    <TableCell
                      colSpan={Object.keys(parsedData[0]).length}
                      className="text-center text-muted-foreground"
                    >
                      {parsedData.length - 10} more rows not shown in preview
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Alert className={supabaseAvailable ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
            <Info className={`h-4 w-4 ${supabaseAvailable ? "text-green-600" : "text-amber-600"}`} />
            <AlertTitle className={supabaseAvailable ? "text-green-700" : "text-amber-700"}>
              {supabaseAvailable ? "Ready to Save to Database" : "Limited Storage Available"}
            </AlertTitle>
            <AlertDescription className={supabaseAvailable ? "text-green-700" : "text-amber-700"}>
              {supabaseAvailable
                ? "The data looks good and is ready to be saved to the Supabase database. This data will be stored persistently and shared with all users of the application."
                : "Supabase is not available. The data will only be stored in your browser and will not be shared across users or devices."}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="secondary" onClick={() => setCurrentStep("upload")}>
          Back to Upload
        </Button>
        <Button onClick={handleSaveMatrix} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Matrix Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Matrix Data Saved Successfully!</CardTitle>
        <CardDescription>
          {dataSource === "supabase"
            ? "The decision matrix data has been saved to the Supabase database and is now available to all users of the application."
            : "The decision matrix data has been saved to your browser storage."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center pt-6">
        {warning && (
          <Alert className="border-amber-500 bg-amber-50 text-left">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700">Note</AlertTitle>
            <AlertDescription className="text-amber-700">{warning}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-md">
          <p className="font-medium">Matrix Details</p>
          <div className="flex justify-center gap-8 mt-2">
            <div>
              <p className="text-muted-foreground text-sm">Rows</p>
              <p className="text-2xl font-semibold">{parsedData.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Columns</p>
              <p className="text-2xl font-semibold">{parsedData.length > 0 ? Object.keys(parsedData[0]).length : 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Storage</p>
              <p className="text-sm font-medium">
                {dataSource === "supabase" ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Database className="h-4 w-4" /> Supabase
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600">
                    <HardDrive className="h-4 w-4" /> Browser
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Last Updated</p>
              <p className="text-sm font-medium">{lastUpdated ? new Date(lastUpdated).toLocaleString() : "Just now"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4 border-t pt-6">
        <Button variant="outline" onClick={() => setCurrentStep("upload")}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Another File
        </Button>
        <Button onClick={handleGoToApp}>
          <Database className="h-4 w-4 mr-2" />
          Go to Application
        </Button>
      </CardFooter>
    </Card>
  )

  const renderCurrentDataInfo = () => {
    if (!lastUpdated && !dataSource) {
      return null
    }

    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Current Matrix Data Status
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={handleRefreshMatrixData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Matrix Data Information
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Matrix Admin Panel</h1>
      <p className="text-muted-foreground mb-4">Manage the decision matrix data for the Feature Prioritization Tool</p>

      <SharedDataNotice supabaseAvailable={supabaseAvailable} />

      {renderCurrentDataInfo()}

      {renderStepIndicator()}

      {currentStep === "upload" && renderUploadStep()}
      {currentStep === "preview" && renderPreviewStep()}
      {currentStep === "success" && renderSuccessStep()}

      {/* Matrix Data Dialog */}
      <Dialog open={showMatrixDialog} onOpenChange={setShowMatrixDialog}>
        <DialogContent className="max-w-4xl max-h-screen">
          <DialogHeader>
            <DialogTitle>Current Matrix Data</DialogTitle>
            <DialogDescription>
              Source: {dataSource || 'Unknown'} | Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            {currentMatrixData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(currentMatrixData[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMatrixData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No matrix data available</div>
            )}
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMatrixDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
