"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { parseCSV } from "./utils/csv-parser"
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react"
import { saveMatrixData } from "./utils/matrix-service"

export default function CSVUploader() {
  const [csvData, setCsvData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample CSV data
  const SAMPLE_CSV = `Priority,Risk,Confidence,Data,Size,Timing,Recommendation
Must have,High,No data,No Research,L,Start,A/B Test
Must have,High,Inconclusive data,Qualitative and/or Quantitative Research,L,Start,A/B Test
Must have,High,Conclusive data,Qualitative and/or Quantitative Research,L,Start,Proceed without Testing
Must have,Medium,No data,No Research,M,Middle,A/B Test
Must have,Medium,Inconclusive data,Qualitative and/or Quantitative Research,M,Middle,A/B Test
Must have,Medium,Conclusive data,Qualitative and/or Quantitative Research,M,Middle,Proceed without Testing
Must have,Low,No data,No Research,S,End,A/B Test
Must have,Low,Inconclusive data,Qualitative and/or Quantitative Research,S,End,A/B Test
Must have,Low,Conclusive data,Qualitative and/or Quantitative Research,S,End,Proceed without Testing`

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
      setSuccess("CSV file loaded. Click 'Upload Matrix Data' to save it.")
    }
    reader.onerror = () => {
      setError("Failed to read the file")
    }
    reader.readAsText(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const loadSampleCSV = () => {
    setCsvData(SAMPLE_CSV)
    setSuccess("Sample CSV data loaded. Click 'Upload Matrix Data' to save it.")
  }

  const handleUploadCSV = async () => {
    if (!csvData.trim()) {
      setError("Please enter CSV data or upload a CSV file")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Parse the CSV data
      const parsedData = parseCSV(csvData)

      if (parsedData.length === 0) {
        setError("No valid data found in CSV")
        setIsLoading(false)
        return
      }

      // Save the data to Supabase
      const result = await saveMatrixData(parsedData)

      if (result.success) {
        setSuccess(`Successfully uploaded ${parsedData.length} rows of matrix data. All users will now see this data.`)
      } else {
        setError(result.error || "Failed to save matrix data")
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Decision Matrix Data</CardTitle>
        <CardDescription>
          Upload a CSV file containing the decision matrix data. This data will be available to all users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Upload CSV File</h3>
            <div className="flex items-center gap-2">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <Button onClick={triggerFileInput} variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV File
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Use Sample Data</h3>
            <Button onClick={loadSampleCSV} variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Load Sample CSV Data
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Or Paste CSV Data</h3>
          <Textarea
            placeholder="Paste CSV data here..."
            className="min-h-[200px]"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUploadCSV} disabled={isLoading || !csvData.trim()} className="w-full">
          {isLoading ? "Uploading..." : "Upload Matrix Data"}
        </Button>
      </CardFooter>
    </Card>
  )
}
