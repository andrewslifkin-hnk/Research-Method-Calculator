"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { setMatrixData, debugMatrix } from "./matrix-data"
import { parseCSV } from "./utils/csv-parser"
import { AlertCircle, CheckCircle, FileText, Upload, Database, AlertTriangle, Bug } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveMatrixData } from "./utils/storage"

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

interface CSVParserProps {
  adminMode?: boolean
}

export default function CSVParser({ adminMode = false }: CSVParserProps) {
  const [csvData, setCsvData] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [forceLoad, setForceLoad] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [persistToStorage, setPersistToStorage] = useState(adminMode)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSVData = () => {
    try {
      setError(null)
      setSuccess(null)
      setIsLoading(true)

      if (!csvData.trim()) {
        setError("Please enter CSV data or upload a CSV file")
        setIsLoading(false)
        return
      }

      // Parse the CSV data
      const result = parseCSV(csvData, debugMode)

      if (result.length === 0) {
        setError("No valid data found in CSV")
        setIsLoading(false)
        return
      }

      // Log the first row to help with debugging
      console.log("First row of parsed data:", result[0])
      console.log("Available columns:", Object.keys(result[0]))

      // If force load is enabled, we'll create a mapping from available columns to required columns
      if (forceLoad) {
        const requiredColumns = ["Priority", "Risk", "Confidence", "Size", "Timing", "Recommendation"]
        const availableColumns = Object.keys(result[0])

        // Create a mapping from available columns to required columns
        // This is a simple mapping based on position - first available column maps to first required column, etc.
        const columnMapping: Record<string, string> = {}

        // Map available columns to required columns
        for (let i = 0; i < Math.min(availableColumns.length, requiredColumns.length); i++) {
          columnMapping[availableColumns[i]] = requiredColumns[i]
        }

        console.log("Column mapping:", columnMapping)

        // Transform the data using the mapping
        const transformedData = result.map((row) => {
          const newRow: Record<string, string> = {}

          // Map each column according to our mapping
          Object.keys(row).forEach((col) => {
            const mappedCol = columnMapping[col] || col
            newRow[mappedCol] = row[col]
          })

          return newRow
        })

        console.log("Transformed data sample:", transformedData.slice(0, 2))

        // Set the matrix data
        setMatrixData(transformedData)
        setParsedData(transformedData)
        setShowPreview(true)

        // Save to localStorage if in admin mode and persistToStorage is enabled
        if (persistToStorage) {
          saveMatrixData(transformedData)
        }

        // Debug the matrix if debug mode is enabled
        if (debugMode) {
          debugMatrix()
        }

        setSuccess(
          `Successfully loaded ${transformedData.length} rows of data with force mapping. The decision matrix has been updated.${
            persistToStorage ? " Data has been saved to browser storage." : ""
          }`,
        )
        setIsLoading(false)
        return
      }

      // If not force loading, check for required columns
      const requiredColumns = ["Priority", "Risk", "Confidence", "Size", "Timing", "Recommendation"]
      const availableColumns = Object.keys(result[0]).map((col) => col.toLowerCase().trim())

      // Log available columns for debugging
      console.log("Available columns (lowercase):", availableColumns)

      const missingColumns = requiredColumns.filter(
        (col) =>
          !availableColumns.includes(col.toLowerCase()) &&
          !availableColumns.includes(col.toLowerCase().replace(/[_\s-]/g, "")),
      )

      if (missingColumns.length > 0) {
        setError(
          `CSV is missing required columns: ${missingColumns.join(", ")}. Please check your CSV format or enable "Force Load" option.`,
        )
        setIsLoading(false)
        return
      }

      console.log("Parsed CSV data:", result)
      setParsedData(result)
      setShowPreview(true)

      // Set the matrix data
      setMatrixData(result)

      // Save to localStorage if in admin mode and persistToStorage is enabled
      if (persistToStorage) {
        saveMatrixData(result)
      }

      // Debug the matrix if debug mode is enabled
      if (debugMode) {
        debugMatrix()
      }

      setSuccess(
        `Successfully loaded ${result.length} rows of data. The decision matrix has been updated.${
          persistToStorage ? " Data has been saved to browser storage." : ""
        }`,
      )
      setIsLoading(false)
    } catch (err) {
      setError(`Failed to parse CSV: ${err instanceof Error ? err.message : "Unknown error"}. Please check the format.`)
      console.error(err)
      setIsLoading(false)
    }
  }

  const loadSampleCSV = () => {
    setCsvData(SAMPLE_CSV)
    setSuccess("Sample CSV data loaded. Click 'Load Matrix Data' to use it.")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setSuccess(null)

    const file = event.target.files?.[0]
    if (!file) {
      setError("No file selected")
      return
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please select a CSV file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvData(content)
      setSuccess("CSV file loaded. Click 'Load Matrix Data' to use it.")
    }
    reader.onerror = () => {
      setError("Failed to read the file")
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const toggleDebugMatrix = () => {
    debugMatrix()
    alert("Matrix data has been logged to the console. Press F12 to open developer tools and check the console.")
  }

  // If not in admin mode, don't show the component
  if (!adminMode) {
    return null
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="bg-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Decision Matrix Data Loader
        </CardTitle>
        <CardDescription>
          Load the decision matrix data to ensure accurate recommendations for your features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {forceLoad && (
          <Alert className="mb-4 border-amber-500 text-amber-500">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Force Load Enabled</AlertTitle>
            <AlertDescription>
              Column validation is bypassed. Columns will be mapped by position rather than by name.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Option 1: Upload CSV File</h3>
            <div className="flex items-center gap-2">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <Button onClick={triggerFileInput} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV File
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Option 2: Use Sample Data</h3>
            <Button onClick={loadSampleCSV} variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Load Sample CSV Data
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Option 3: Paste CSV Data</h3>
          <Textarea
            placeholder="Paste CSV data here..."
            className="min-h-[200px]"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Switch id="force-load" checked={forceLoad} onCheckedChange={setForceLoad} />
            <Label htmlFor="force-load">Force Load (bypass column validation)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="debug-mode" checked={debugMode} onCheckedChange={setDebugMode} />
            <Label htmlFor="debug-mode">Debug Mode (more detailed logging)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="persist-storage" checked={persistToStorage} onCheckedChange={setPersistToStorage} />
            <Label htmlFor="persist-storage">Save to Browser Storage (persists between sessions)</Label>
          </div>
        </div>

        {showPreview && parsedData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Data Preview (first 3 rows)</h3>
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(parsedData[0]).map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 3).map((row, index) => (
                    <TableRow key={index}>
                      {Object.keys(parsedData[0]).map((column) => (
                        <TableCell key={column}>{row[column]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
        <div className="flex w-full gap-2">
          <Button onClick={parseCSVData} disabled={isLoading} className="flex-1">
            {isLoading ? "Processing..." : "Load Matrix Data"}
          </Button>
          {parsedData.length > 0 && (
            <Button onClick={toggleDebugMatrix} variant="outline" size="icon">
              <Bug className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
