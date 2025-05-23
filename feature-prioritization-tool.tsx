"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  CheckCircle,
  Check,
  Star,
  AlertTriangle,
  BarChart,
  Clock,
  Gauge,
  Users,
  BarChart4,
  LineChart,
  Search,
  FlaskConical,
  Trophy,
  ThumbsUp,
  Sparkles,
  ShieldAlert,
  ShieldQuestion,
  ShieldCheck,
  HelpCircle,
  CircleDashed,
  CircleCheck,
  Maximize2,
  Square,
  Minimize2,
  CalendarRange,
  CalendarClock,
  CalendarCheck,
  Database,
  Settings,
  Info,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchMatrixData, getRecommendation, getUniqueValues, type MatrixDataRow } from "./utils/matrix-service"
import Link from "next/link"
import { saveFeaturesToSupabase } from "@/utils/supabase"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Feature {
  name: string
  priority: string
  risk: string
  confidence: string
  data: string
  size: string
  timing: string
  recommendation: string
}

interface RecommendationResult {
  methods: string[]
  explanation: string
  priority: number
}

// Function to get the appropriate icon for each option
function getOptionIcon(category: string, option: string): React.ReactNode {
  // Priority icons
  if (category === "priority") {
    if (option.toLowerCase().includes("must")) return <Trophy className="h-5 w-5 text-amber-500" />
    if (option.toLowerCase().includes("should")) return <ThumbsUp className="h-5 w-5 text-blue-500" />
    if (option.toLowerCase().includes("nice")) return <Sparkles className="h-5 w-5 text-purple-500" />
    return <Star className="h-5 w-5 text-amber-500" />
  }

  // Risk icons
  if (category === "risk") {
    if (option.toLowerCase().includes("high")) return <ShieldAlert className="h-5 w-5 text-red-500" />
    if (option.toLowerCase().includes("medium")) return <ShieldQuestion className="h-5 w-5 text-orange-500" />
    if (option.toLowerCase().includes("low")) return <ShieldCheck className="h-5 w-5 text-green-500" />
    return <AlertTriangle className="h-5 w-5 text-orange-500" />
  }

  // Confidence icons
  if (category === "confidence") {
    if (option.toLowerCase().includes("no data")) return <HelpCircle className="h-5 w-5 text-gray-500" />
    if (option.toLowerCase().includes("inconclusive")) return <CircleDashed className="h-5 w-5 text-yellow-500" />
    if (option.toLowerCase().includes("conclusive")) return <CircleCheck className="h-5 w-5 text-green-500" />
    return <Gauge className="h-5 w-5 text-blue-500" />
  }

  // Data type icons
  if (category === "data") {
    if (option === "N/A") return <Database className="h-5 w-5 text-gray-400" />
    if (option.toLowerCase().includes("qualitative") && option.toLowerCase().includes("quantitative"))
      return <Database className="h-5 w-5 text-blue-500" />
    if (option.toLowerCase().includes("qualitative")) return <Database className="h-5 w-5 text-indigo-500" />
    if (option.toLowerCase().includes("quantitative")) return <Database className="h-5 w-5 text-purple-500" />
    return <Database className="h-5 w-5 text-blue-500" />
  }

  // Size icons
  if (category === "size") {
    if (option.toLowerCase().includes("large") || option === "L") return <Maximize2 className="h-5 w-5 text-red-500" />
    if (option.toLowerCase().includes("medium") || option === "M") return <Square className="h-5 w-5 text-orange-500" />
    if (option.toLowerCase().includes("small") || option === "S")
      return <Minimize2 className="h-5 w-5 text-green-500" />
    return <BarChart className="h-5 w-5 text-purple-500" />
  }

  // Timing icons
  if (category === "timing") {
    if (option.toLowerCase().includes("start")) return <CalendarRange className="h-5 w-5 text-blue-500" />
    if (option.toLowerCase().includes("half") || option.toLowerCase().includes("middle"))
      return <CalendarClock className="h-5 w-5 text-orange-500" />
    if (option.toLowerCase().includes("end")) return <CalendarCheck className="h-5 w-5 text-green-500" />
    return <Clock className="h-5 w-5 text-green-500" />
  }

  // Default icon
  return <CheckCircle className="h-5 w-5" />
}

// Fallback data in case the API fails
const FALLBACK_DATA: MatrixDataRow[] = [
  {
    Priority: "Must have",
    Risk: "High",
    Confidence: "No data",
    Data: "No Research",
    Size: "L",
    Timing: "Start",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Medium",
    Confidence: "Inconclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "M",
    Timing: "Middle",
    Recommendation: "A/B Test",
  },
  {
    Priority: "Must have",
    Risk: "Low",
    Confidence: "Conclusive data",
    Data: "Qualitative and/or Quantitative Research",
    Size: "S",
    Timing: "End",
    Recommendation: "Proceed without Testing",
  },
  // Add more fallback data as needed
]

export default function FeaturePrioritizationTool() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [currentFeature, setCurrentFeature] = useState<Feature>({
    name: "",
    priority: "",
    risk: "",
    confidence: "",
    data: "",
    size: "",
    timing: "",
    recommendation: "",
  })
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [matrixData, setMatrixData] = useState<MatrixDataRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Options for selections
  const [priorityOptions, setPriorityOptions] = useState<string[]>([])
  const [riskOptions, setRiskOptions] = useState<string[]>([])
  const [confidenceOptions, setConfidenceOptions] = useState<string[]>([])
  const [dataOptions, setDataOptions] = useState<string[]>([])
  const [sizeOptions, setSizeOptions] = useState<string[]>([])
  const [timingOptions, setTimingOptions] = useState<string[]>([])

  const [openInfo, setOpenInfo] = useState<null | "risk" | "confidence" | "data">(null);

  const riskInfo = (
    <ul className="list-disc pl-4 space-y-2 text-foreground">
      <li><b>High</b> – Not implementing the feature can cause major user frustration, revenue loss, or reputational damage.</li>
      <li><b>Medium</b> – Moderate consequences if the feature fails. May affect some users or KPIs but is recoverable.</li>
      <li><b>Low</b> – Minimal impact. Low user exposure, minimal cost to reverse, or minor relevance to core goals.</li>
    </ul>
  );
  const confidenceInfo = (
    <ul className="list-disc pl-4 space-y-2 text-foreground">
      <li><b>No data</b> – No prior data or research available.</li>
      <li><b>Inconclusive data</b> – Existing data (quantitative or qualitative) is conflicting, partial or inconclusive. Not enough to make a decision.</li>
      <li><b>Conclusive data</b> – Strong evidence from past quantitative and/or qualitative tests, analytics or user research supports the decision. High confidence in user value and impact.</li>
    </ul>
  );
  const dataInfo = (
    <ul className="list-disc pl-4 space-y-2 text-foreground">
      <li><b>Qualitative Research</b> – Insights from interviews, surveys, usability tests, market benchmark, etc. Focus on user behavior and motivations.</li>
      <li><b>Quantitative Research</b> – Data from experiments (A/B tests), analytics, and behavioral metrics.</li>
      <li><b>Mixed Methods</b> – A combination of qualitative and quantitative approaches. Useful when both depth and scale of insight are needed.</li>
    </ul>
  );

  // Check if confidence is "No data"
  const isNoDataConfidence = currentFeature.confidence && currentFeature.confidence.toLowerCase().includes("no data")

  // Load matrix data on component mount
  useEffect(() => {
    async function loadMatrixData() {
      setIsLoading(true)
      try {
        const result = await fetchMatrixData()

        if (result.success && result.data && result.data.length > 0) {
          setMatrixData(result.data)
          setLastUpdated(result.lastUpdated)

          // Set options for selections
          setPriorityOptions(getUniqueValues(result.data, "Priority"))
          setRiskOptions(getUniqueValues(result.data, "Risk"))
          setConfidenceOptions(getUniqueValues(result.data, "Confidence"))
          setDataOptions(getUniqueValues(result.data, "Data"))
          setSizeOptions(getUniqueValues(result.data, "Size"))
          setTimingOptions(getUniqueValues(result.data, "Timing"))

          // Show a warning if using fallback data
          if (result.source !== "supabase") {
            setError(`Using ${result.source} data instead of the database. Check your Supabase configuration.`)
          } else {
            setError(null)
          }
        } else {
          // Use fallback data if API fails
          setMatrixData(FALLBACK_DATA)

          // Set options for selections from fallback data
          setPriorityOptions(getUniqueValues(FALLBACK_DATA, "Priority"))
          setRiskOptions(getUniqueValues(FALLBACK_DATA, "Risk"))
          setConfidenceOptions(getUniqueValues(FALLBACK_DATA, "Confidence"))
          setDataOptions(getUniqueValues(FALLBACK_DATA, "Data"))
          setSizeOptions(getUniqueValues(FALLBACK_DATA, "Size"))
          setTimingOptions(getUniqueValues(FALLBACK_DATA, "Timing"))

          const errorMessage = result.error ? 
            `Could not load matrix data: ${result.error}. Using fallback data.` : 
            "Could not load matrix data from server. Using fallback data."
          setError(errorMessage)
        }
      } catch (err) {
        console.error("Error loading matrix data:", err)

        // Use fallback data if there's an error
        setMatrixData(FALLBACK_DATA)

        // Set options for selections from fallback data
        setPriorityOptions(getUniqueValues(FALLBACK_DATA, "Priority"))
        setRiskOptions(getUniqueValues(FALLBACK_DATA, "Risk"))
        setConfidenceOptions(getUniqueValues(FALLBACK_DATA, "Confidence"))
        setDataOptions(getUniqueValues(FALLBACK_DATA, "Data"))
        setSizeOptions(getUniqueValues(FALLBACK_DATA, "Size"))
        setTimingOptions(getUniqueValues(FALLBACK_DATA, "Timing"))

        const errorMessage = err instanceof Error ? 
          `Error loading matrix data: ${err.message}. Using fallback data.` : 
          "Unknown error loading matrix data. Using fallback data."
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadMatrixData()
  }, [])

  // Function to determine if a data option is valid based on the selected confidence
  const isDataOptionValid = (option: string): boolean => {
    if (!currentFeature.confidence) {
      // If no confidence is selected, all options are valid
      return true
    }

    if (isNoDataConfidence) {
      // If confidence is "No data", only "No Research" is valid
      return option === "No Research"
    } else if (currentFeature.confidence.toLowerCase().includes("inconclusive")) {
      // If confidence is "Inconclusive data", only these options are valid
      return ["Qualitative and/or Quantitative Data", "Qualitative and/or Quantitative Research"].includes(option)
    } else if (currentFeature.confidence.toLowerCase().includes("conclusive")) {
      // If confidence is "Conclusive data", only these options are valid
      return [
        "Quantitative data",
        "Qualitative and/or Quantitative Research",
        "Qualitative and/or Quantitative Data",
      ].includes(option)
    }

    return true
  }

  // Effect to handle conditional logic for data type based on confidence
  useEffect(() => {
    if (isNoDataConfidence && currentFeature.data !== "No Research") {
      setCurrentFeature((prev) => ({
        ...prev,
        data: "No Research",
      }))
    } else if (currentFeature.data === "No Research" && !isNoDataConfidence && currentFeature.confidence) {
      setCurrentFeature((prev) => ({
        ...prev,
        data: "",
      }))
    }
  }, [currentFeature.confidence, isNoDataConfidence])

  const getFeatureRecommendations = (feature: Feature): RecommendationResult => {
    // Get recommendation from the matrix
    const methods = getRecommendation(
      matrixData,
      feature.priority,
      feature.risk,
      feature.confidence,
      feature.data,
      feature.size,
      feature.timing,
    )

    // Determine priority score based on feature attributes
    let priority = 0

    // Priority scoring
    if (feature.priority === "Must have") priority += 3
    else if (feature.priority === "Should have") priority += 2
    else priority += 1

    // Risk scoring
    if (feature.risk === "High") priority += 3
    else if (feature.risk === "Medium") priority += 2
    else priority += 1

    // Size scoring
    if (feature.size === "Large" || feature.size === "L") priority += 3
    else if (feature.size === "Medium" || feature.size === "M") priority += 2
    else priority += 1

    // Generate explanation based on the match
    let explanation = ""
    if (feature.confidence.toLowerCase().includes("no data")) {
      explanation = `Based on ${feature.priority} priority, ${feature.risk} risk, and ${feature.confidence} confidence, with ${feature.size} size and ${feature.timing} timing, we recommend ${methods.join(" or ")}.`
    } else {
      explanation = `Based on ${feature.priority} priority, ${feature.risk} risk, ${feature.confidence} confidence, ${feature.data} data type, with ${feature.size} size and ${feature.timing} timing, we recommend ${methods.join(" or ")}.`
    }

    return {
      methods,
      explanation,
      priority,
    }
  }

  const handleAnalyzeFeature = async () => {
    if (currentFeature.name.trim() === "") {
      alert("Please enter a feature name")
      return
    }

    if (
      !currentFeature.name ||
      !currentFeature.priority ||
      !currentFeature.risk ||
      !currentFeature.confidence ||
      !currentFeature.size ||
      !currentFeature.timing ||
      // Only require data if confidence is not "No data"
      (!currentFeature.data && !isNoDataConfidence)
    ) {
      alert("Please select all applicable feature attributes")
      return
    }

    // Calculate recommendations
    const result = getFeatureRecommendations(currentFeature)
    setRecommendations(result)
    setShowRecommendations(true)

    // Save to Supabase via API route
    try {
      const newFeatureWithRecommendation = {
        ...currentFeature,
        recommendation: result.methods.join(", ")
      }
      const newFeatures = [...features, newFeatureWithRecommendation]
      setFeatures(newFeatures)
      const response = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: newFeatures }),
      })
      const apiResult = await response.json()
      if (!apiResult.success) {
        throw new Error(apiResult.error || "Unknown error")
      }
    } catch (error) {
      toast({
        title: "Failed to save feature",
        description: "Could not save feature to Supabase. Please try again later.",
        variant: "destructive",
      })
    }

    // Scroll to recommendations
    setTimeout(() => {
      document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleResetForm = () => {
    // Reset form
    setCurrentFeature({
      name: "",
      priority: "",
      risk: "",
      confidence: "",
      data: "",
      size: "",
      timing: "",
      recommendation: "",
    })
    setShowRecommendations(false)
    setRecommendations(null)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Unmoderated test":
        return <Users className="h-4 w-4 mr-2" />
      case "Pre-post analysis":
        return <BarChart4 className="h-4 w-4 mr-2" />
      case "Monitor with Analytics":
        return <LineChart className="h-4 w-4 mr-2" />
      case "Exploratory research":
        return <Search className="h-4 w-4 mr-2" />
      case "UX research & A/B test":
      case "A/B Test":
        return <FlaskConical className="h-4 w-4 mr-2" />
      case "Proceed without Testing":
        return <CheckCircle className="h-4 w-4 mr-2" />
      default:
        return <CheckCircle className="h-4 w-4 mr-2" />
    }
  }

  const getPriorityBadge = (priority: number) => {
    if (priority >= 10) {
      return <Badge className="bg-red-500">High Priority</Badge>
    } else if (priority >= 7) {
      return <Badge className="bg-amber-500">Medium Priority</Badge>
    } else {
      return <Badge className="bg-green-500">Low Priority</Badge>
    }
  }

  const SelectionCard = ({
    icon,
    title,
    selected,
    onClick,
    disabled = false,
  }: {
    icon?: React.ReactNode
    title: string
    selected: boolean
    onClick: () => void
    disabled?: boolean
  }) => (
    <div
      className={`relative border rounded-lg p-3 transition-all ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
          : selected
            ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
            : "hover:border-gray-300 hover:shadow-md cursor-pointer"
      }`}
      onClick={disabled ? undefined : onClick}
    >
      {selected && (
        <div className="absolute top-2 right-2 text-primary">
          <Check className="h-4 w-4" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2 py-1">
        {icon && <div className={disabled ? "text-gray-400" : "text-muted-foreground"}>{icon}</div>}
        <div className={`font-medium text-center ${disabled ? "text-gray-400" : ""}`}>{title}</div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading decision matrix data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Experimentation Method Calculator</CardTitle>
              <CardDescription>
                Assess features and get recommendations on the most appropriate research methods
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  error ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"
                }
              >
                <Database className="h-3 w-3 mr-1" />
                {error ? "Using Fallback Data" : "Matrix Data Loaded"}
              </Badge>
              <Link href="/admin">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showRecommendations ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">Feature Name</h2>
                <p className="text-muted-foreground mb-4">Enter the name of the feature you want to analyze.</p>
                <div className="max-w-md">
                  <Input
                    placeholder="Enter feature name"
                    value={currentFeature.name}
                    onChange={(e) => setCurrentFeature({ ...currentFeature, name: e.target.value })}
                    className="text-lg py-6"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Priority
                </h2>
                <p className="text-muted-foreground mb-4">How important is this feature to your product?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {priorityOptions.map((option) => (
                    <SelectionCard
                      key={option}
                      icon={getOptionIcon("priority", option)}
                      title={option}
                      selected={currentFeature.priority === option}
                      onClick={() => setCurrentFeature({ ...currentFeature, priority: option })}
                    />
                  ))}
                </div>
              </div>

              {/* Risk Section with Info Dialog */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Risk
                  <Dialog open={openInfo === "risk"} onOpenChange={open => setOpenInfo(open ? "risk" : null)}>
                    <DialogTrigger asChild>
                      <button type="button" className="ml-1 text-muted-foreground hover:text-primary" aria-label="Risk info">
                        <Info className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Risk Levels</DialogTitle>
                      </DialogHeader>
                      {riskInfo}
                    </DialogContent>
                  </Dialog>
                </h2>
                <p className="text-muted-foreground mb-4">What level of risk does this feature carry?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {riskOptions.map((option) => (
                    <SelectionCard
                      key={option}
                      icon={getOptionIcon("risk", option)}
                      title={option}
                      selected={currentFeature.risk === option}
                      onClick={() => setCurrentFeature({ ...currentFeature, risk: option })}
                    />
                  ))}
                </div>
              </div>

              {/* Confidence Section with Info Dialog */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-blue-500" />
                  Confidence
                  <Dialog open={openInfo === "confidence"} onOpenChange={open => setOpenInfo(open ? "confidence" : null)}>
                    <DialogTrigger asChild>
                      <button type="button" className="ml-1 text-muted-foreground hover:text-primary" aria-label="Confidence info">
                        <Info className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confidence Levels</DialogTitle>
                      </DialogHeader>
                      {confidenceInfo}
                    </DialogContent>
                  </Dialog>
                </h2>
                <p className="text-muted-foreground mb-4">How confident are you in the data you have?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {confidenceOptions.map((option) => (
                    <SelectionCard
                      key={option}
                      icon={getOptionIcon("confidence", option)}
                      title={option}
                      selected={currentFeature.confidence === option}
                      onClick={() => setCurrentFeature({ ...currentFeature, confidence: option })}
                    />
                  ))}
                </div>
              </div>

              {/* Data Type Section with Info Dialog */}
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Data Type
                  <Dialog open={openInfo === "data"} onOpenChange={open => setOpenInfo(open ? "data" : null)}>
                    <DialogTrigger asChild>
                      <button type="button" className="ml-1 text-muted-foreground hover:text-primary" aria-label="Data type info">
                        <Info className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Data Types</DialogTitle>
                      </DialogHeader>
                      {dataInfo}
                    </DialogContent>
                  </Dialog>
                </h2>
                <p className="text-muted-foreground mb-4">
                  {isNoDataConfidence
                    ? "Only 'No Research' is available when confidence is 'No data'"
                    : currentFeature.confidence && currentFeature.confidence.toLowerCase().includes("inconclusive")
                      ? "Select the type of data available for this inconclusive confidence level"
                      : currentFeature.confidence && currentFeature.confidence.toLowerCase().includes("conclusive")
                        ? "Select the type of data available for this conclusive confidence level"
                        : "What type of data is available for this feature?"}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dataOptions.filter(option => option !== 'N/A').map((option) => (
                    <SelectionCard
                      key={option}
                      icon={getOptionIcon("data", option)}
                      title={option}
                      selected={currentFeature.data === option}
                      onClick={() => setCurrentFeature({ ...currentFeature, data: option })}
                      disabled={!isDataOptionValid(option)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-500" />
                  Size
                </h2>
                <p className="text-muted-foreground mb-4">What is the implementation size of this feature?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sizeOptions.map((option) => (
                    <SelectionCard
                      key={option}
                      icon={getOptionIcon("size", option)}
                      title={option}
                      selected={currentFeature.size === option}
                      onClick={() => setCurrentFeature({ ...currentFeature, size: option })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Timing
                </h2>
                <p className="text-muted-foreground mb-4">When in the quarter will this feature be implemented?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {timingOptions.map((option) => (
                    <SelectionCard
                      key={option}
                      icon={getOptionIcon("timing", option)}
                      title={option}
                      selected={currentFeature.timing === option}
                      onClick={() => setCurrentFeature({ ...currentFeature, timing: option })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleAnalyzeFeature}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  disabled={
                    !currentFeature.name ||
                    !currentFeature.priority ||
                    !currentFeature.risk ||
                    !currentFeature.confidence ||
                    !currentFeature.size ||
                    !currentFeature.timing ||
                    (!currentFeature.data && !isNoDataConfidence)
                  }
                >
                  Analyze Feature
                </Button>
              </div>
            </div>
          ) : recommendations ? (
            <div id="recommendations" className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Feature Analysis</AlertTitle>
                  <AlertDescription>
                    Based on your inputs for <span className="font-semibold">{currentFeature.name}</span>, we recommend
                    the following research methods.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recommended Methods</h3>
                  {getPriorityBadge(recommendations.priority)}
                </div>

                <div className="grid gap-2 mb-6">
                  {recommendations.methods.map((method, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-md bg-background">
                      {getMethodIcon(method)}
                      <span>{method}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                  <p className="text-muted-foreground">{recommendations.explanation}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Feature Attributes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="p-2 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">Priority</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getOptionIcon("priority", currentFeature.priority)}
                        <p>{currentFeature.priority}</p>
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">Risk</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getOptionIcon("risk", currentFeature.risk)}
                        <p>{currentFeature.risk}</p>
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getOptionIcon("confidence", currentFeature.confidence)}
                        <p>{currentFeature.confidence}</p>
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">Data Type</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getOptionIcon("data", currentFeature.data)}
                        <p>{currentFeature.data}</p>
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">Size</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getOptionIcon("size", currentFeature.size)}
                        <p>{currentFeature.size}</p>
                      </div>
                    </div>
                    <div className="p-2 border rounded-md bg-background">
                      <span className="text-sm text-muted-foreground">Timing</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getOptionIcon("timing", currentFeature.timing)}
                        <p>{currentFeature.timing}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleResetForm} size="lg">
                  Analyze Another Feature
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {features.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Feature History</CardTitle>
            <CardDescription>Previously analyzed features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{feature.name}</h3>
                    {getPriorityBadge(getFeatureRecommendations(feature).priority)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getOptionIcon("priority", feature.priority)}
                        <span>{feature.priority}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getOptionIcon("risk", feature.risk)}
                        <span>{feature.risk}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getOptionIcon("confidence", feature.confidence)}
                        <span>{feature.confidence}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Type:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getOptionIcon("data", feature.data)}
                        <span>{feature.data}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getOptionIcon("size", feature.size)}
                        <span>{feature.size}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timing:</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getOptionIcon("timing", feature.timing)}
                        <span>{feature.timing}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground">Recommended methods:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {getFeatureRecommendations(feature).methods.map((method, idx) => (
                        <Badge key={idx} variant="outline" className="flex items-center">
                          {getMethodIcon(method)}
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
