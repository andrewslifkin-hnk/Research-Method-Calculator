"use client"

import { useAuth } from "@/contexts/auth-context"
import AdminLogin from "@/components/admin-login"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, Edit, Save, X, Filter, Download, Upload, Trash2, Check, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { getFeaturesFromSupabase, Feature, saveFeaturesToSupabase } from "@/utils/supabase"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Add a current data status component to the main admin page
// First, import the necessary components at the top of the file

import { useState, useEffect } from "react"
import { fetchMatrixData } from "@/utils/matrix-service"
import { Database, HardDrive, FileText, Info, RefreshCw } from "lucide-react"
import { LayoutDashboard, Settings, Home } from "lucide-react"
import { 
  Trophy, 
  ThumbsUp, 
  Sparkles, 
  Star, 
  ShieldAlert, 
  ShieldQuestion, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CircleDashed, 
  CircleCheck, 
  Gauge, 
  Maximize2, 
  Square, 
  Minimize2, 
  CalendarRange, 
  CalendarClock, 
  CalendarCheck, 
  Clock 
} from "lucide-react"

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/admin/matrix",
    icon: <Settings className="h-5 w-5" />,
  },
]

// Add the back to app link
const navigationLinks = [
  {
    label: "Back to App",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
]

// Priority options for select
const priorityOptions = ["Must have", "Should have", "Could have", "Won't have"]
const riskOptions = ["Low", "Medium", "High"]
const confidenceOptions = ["Conclusive data", "Inconclusive data", "No data"]
const dataOptions = ["Qualitative and/or Quantitative Data", "Qualitative only", "Quantitative only", "No data"]
const sizeOptions = ["XS", "S", "M", "L", "XL"]
const timingOptions = ["Start", "Half", "End"]
const recommendationOptions = [
  "Optional Validation (Quantitative or Qualitative)",
  "Quantitative A/B Test and/or Deep Qualitative Research",
  "Targeted Qualitative Research",
  "Optional Validation + Focus groups",
  "Quantitative Survey"
]

// Helper to get color for badges
const getBadgeVariant = (value: string) => {
  if (value.toLowerCase().includes("high") || value.toLowerCase().includes("must")) return "destructive"
  if (value.toLowerCase().includes("medium") || value.toLowerCase().includes("should")) return "secondary"
  if (value.toLowerCase().includes("low") || value.toLowerCase().includes("could")) return "secondary"
  if (value.toLowerCase().includes("test")) return "default"
  return "outline"
}

// Function to get the appropriate icon for each option
function getOptionIcon(category: string, option: string): React.ReactNode {
  // Priority icons
  if (category === "priority") {
    if (option.toLowerCase().includes("must")) return <Trophy className="h-4 w-4 text-amber-500" />
    if (option.toLowerCase().includes("should")) return <ThumbsUp className="h-4 w-4 text-blue-500" />
    if (option.toLowerCase().includes("could")) return <Sparkles className="h-4 w-4 text-purple-500" />
    if (option.toLowerCase().includes("won't")) return <Star className="h-4 w-4 text-gray-400" />
    return <Star className="h-4 w-4 text-amber-500" />
  }

  // Risk icons
  if (category === "risk") {
    if (option.toLowerCase().includes("high")) return <ShieldAlert className="h-4 w-4 text-red-500" />
    if (option.toLowerCase().includes("medium")) return <ShieldQuestion className="h-4 w-4 text-orange-500" />
    if (option.toLowerCase().includes("low")) return <ShieldCheck className="h-4 w-4 text-green-500" />
    return <AlertTriangle className="h-4 w-4 text-orange-500" />
  }

  // Confidence icons
  if (category === "confidence") {
    if (option.toLowerCase().includes("no data")) return <HelpCircle className="h-4 w-4 text-gray-500" />
    if (option.toLowerCase().includes("inconclusive")) return <CircleDashed className="h-4 w-4 text-yellow-500" />
    if (option.toLowerCase().includes("conclusive")) return <CircleCheck className="h-4 w-4 text-green-500" />
    return <Gauge className="h-4 w-4 text-blue-500" />
  }

  // Data type icons
  if (category === "data") {
    if (option === "N/A") return <Database className="h-4 w-4 text-gray-400" />
    if (option.toLowerCase().includes("qualitative") && option.toLowerCase().includes("quantitative"))
      return <Database className="h-4 w-4 text-blue-500" />
    if (option.toLowerCase().includes("qualitative")) return <Database className="h-4 w-4 text-indigo-500" />
    if (option.toLowerCase().includes("quantitative")) return <Database className="h-4 w-4 text-purple-500" />
    return <Database className="h-4 w-4 text-blue-500" />
  }

  // Size icons
  if (category === "size") {
    if (option.toLowerCase().includes("large") || option === "L" || option === "XL") return <Maximize2 className="h-4 w-4 text-red-500" />
    if (option.toLowerCase().includes("medium") || option === "M") return <Square className="h-4 w-4 text-orange-500" />
    if (option.toLowerCase().includes("small") || option === "S" || option === "XS")
      return <Minimize2 className="h-4 w-4 text-green-500" />
    return <Square className="h-4 w-4 text-purple-500" />
  }

  // Timing icons
  if (category === "timing") {
    if (option.toLowerCase().includes("start")) return <CalendarRange className="h-4 w-4 text-blue-500" />
    if (option.toLowerCase().includes("half") || option.toLowerCase().includes("middle"))
      return <CalendarClock className="h-4 w-4 text-orange-500" />
    if (option.toLowerCase().includes("end")) return <CalendarCheck className="h-4 w-4 text-green-500" />
    return <Clock className="h-4 w-4 text-green-500" />
  }

  // Default icon
  return <Check className="h-4 w-4" />
}

export default function AdminPage() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  // Add state variables and useEffect to fetch matrix data info
  // Add this right after the useAuth line in the AdminPage component

  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'dashboard' | 'settings'>('dashboard')
  
  // Bulk edit state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [bulkEditData, setBulkEditData] = useState<Partial<Feature>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (isAuthenticated) {
      loadMatrixInfo()
      loadFeatures()
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

  const loadFeatures = async () => {
    setLoadingFeatures(true)
    try {
      const result = await getFeaturesFromSupabase()
      if (result.success) {
        // Ensure each feature matches the Feature type
        setFeatures(
          (result.data as any[]).map((f) => ({
            name: f.name || "",
            priority: f.priority || "",
            risk: f.risk || "",
            confidence: f.confidence || "",
            data: f.data || "",
            size: f.size || "",
            timing: f.timing || "",
            recommendation: f.recommendation || "",
          }))
        )
      }
    } catch (err) {
      console.error("Error fetching features:", err)
    } finally {
      setLoadingFeatures(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedFeatures.length === filteredFeatures.length) {
      setSelectedFeatures([])
    } else {
      setSelectedFeatures(filteredFeatures.map(f => f.name))
    }
  }

  const toggleFeatureSelection = (name: string) => {
    setSelectedFeatures(prev => 
      prev.includes(name) 
        ? prev.filter(f => f !== name) 
        : [...prev, name]
    )
  }

  const handleBulkEdit = async () => {
    setIsSaving(true)
    try {
      // Update only the selected features with the bulkEditData fields
      const updatedFeatures = features.map(feature => {
        if (selectedFeatures.includes(feature.name)) {
          return {
            ...feature,
            ...Object.fromEntries(
              Object.entries(bulkEditData).filter(([_, value]) => value !== "")
            )
          }
        }
        return feature
      })

      // Save all features back to the database
      await saveFeaturesToSupabase(updatedFeatures)
      setFeatures(updatedFeatures)
      setSelectedFeatures([])
      setBulkEditData({})
      setEditDialogOpen(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving bulk edits:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredFeatures = features.filter(feature => 
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.risk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feature.recommendation.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage)
  const paginatedFeatures = filteredFeatures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(page)
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
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 text-neutral-900 flex">
        <div className="sticky top-0 h-screen">
          <Sidebar className="h-full">
            <SidebarBody className="h-full flex-col justify-between">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <div className="mt-8 flex flex-col gap-2">
                  {sidebarLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
                
                <div className="mt-auto pt-8 border-t border-neutral-200 my-4">
                  {navigationLinks.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            
            {showSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  <span>Features updated successfully!</span>
                </div>
                <button onClick={() => setShowSuccess(false)} className="text-green-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <Card className="shadow border border-neutral-200 bg-white mb-8">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Features</CardTitle>
                    <CardDescription>All features from the database</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => loadFeatures()}
                            disabled={loadingFeatures}
                          >
                            <RefreshCw className={`h-4 w-4 ${loadingFeatures ? 'animate-spin' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh features</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm"
                          disabled={selectedFeatures.length === 0}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Bulk Edit {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Bulk Edit {selectedFeatures.length} Features</DialogTitle>
                          <DialogDescription>
                            Update multiple features at once. Empty fields will keep existing values.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-1 gap-y-4">
                            <div className="space-y-2">
                              <label htmlFor="bulk-priority" className="text-sm font-medium">Priority</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, priority: value})}
                                value={bulkEditData.priority || ""}
                              >
                                <SelectTrigger id="bulk-priority">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {priorityOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bulk-risk" className="text-sm font-medium">Risk</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, risk: value})}
                                value={bulkEditData.risk || ""}
                              >
                                <SelectTrigger id="bulk-risk">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {riskOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bulk-confidence" className="text-sm font-medium">Confidence</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, confidence: value})}
                                value={bulkEditData.confidence || ""}
                              >
                                <SelectTrigger id="bulk-confidence">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {confidenceOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bulk-data" className="text-sm font-medium">Data</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, data: value})}
                                value={bulkEditData.data || ""}
                              >
                                <SelectTrigger id="bulk-data">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {dataOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bulk-size" className="text-sm font-medium">Size</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, size: value})}
                                value={bulkEditData.size || ""}
                              >
                                <SelectTrigger id="bulk-size">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {sizeOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bulk-timing" className="text-sm font-medium">Timing</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, timing: value})}
                                value={bulkEditData.timing || ""}
                              >
                                <SelectTrigger id="bulk-timing">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {timingOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="bulk-recommendation" className="text-sm font-medium">Recommendation</label>
                              <Select 
                                onValueChange={(value) => setBulkEditData({...bulkEditData, recommendation: value})}
                                value={bulkEditData.recommendation || ""}
                              >
                                <SelectTrigger id="bulk-recommendation">
                                  <SelectValue placeholder="No change" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No change</SelectItem>
                                  {recommendationOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleBulkEdit} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="select-all"
                      checked={selectedFeatures.length > 0 && selectedFeatures.length === filteredFeatures.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all features"
                    />
                    <label htmlFor="select-all" className="text-sm text-muted-foreground">
                      {selectedFeatures.length > 0 ? `${selectedFeatures.length} selected` : 'Select all'}
                    </label>
                    <span className="text-xs text-muted-foreground ml-2">
                      {filteredFeatures.length} total features
                    </span>
                  </div>
                  
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search features..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loadingFeatures ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Loading features...</span>
                  </div>
                ) : filteredFeatures.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40">
                    <FileText className="h-10 w-10 text-gray-400 mb-2" />
                    {searchQuery ? (
                      <span className="text-sm text-gray-500">No features match your search</span>
                    ) : (
                      <span className="text-sm text-gray-500">No features found</span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col space-y-3">
                      {paginatedFeatures.map((feature, idx) => (
                        <div 
                          key={idx} 
                          className={`border rounded-lg p-4 transition-all hover:shadow-sm ${
                            selectedFeatures.includes(feature.name) ? "border-primary/50 bg-primary/5" : "border-border hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                checked={selectedFeatures.includes(feature.name)}
                                onCheckedChange={() => toggleFeatureSelection(feature.name)}
                                aria-label={`Select ${feature.name}`}
                              />
                              <h3 className="font-medium text-base">{feature.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full px-3 py-0.5 text-xs">
                                {feature.priority.includes("Must") ? "Must have" : feature.priority}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedFeatures([feature.name])
                                    setBulkEditData({})
                                    setEditDialogOpen(true)
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Feature
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                    <span className="text-destructive">Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-6 gap-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1.5">Risk</span>
                              <div className="flex items-center gap-1.5">
                                {getOptionIcon("risk", feature.risk)}
                                {feature.risk === "High" ? (
                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 hover:text-red-700 font-medium border-0">
                                    {feature.risk}
                                  </Badge>
                                ) : feature.risk === "Medium" ? (
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 hover:text-orange-700 font-medium border-0">
                                    {feature.risk}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700 font-medium border-0">
                                    {feature.risk}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1.5">Confidence</span>
                              <div className="flex items-center gap-1.5">
                                {getOptionIcon("confidence", feature.confidence)}
                                <span className="text-sm">{feature.confidence}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1.5">Data</span>
                              <div className="flex items-center gap-1.5">
                                {getOptionIcon("data", feature.data)}
                                <span className="text-sm">{feature.data}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1.5">Size</span>
                              <div className="flex items-center gap-1.5">
                                {getOptionIcon("size", feature.size)}
                                <span className="text-sm">{feature.size}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1.5">Timing</span>
                              <div className="flex items-center gap-1.5">
                                {getOptionIcon("timing", feature.timing)}
                                <span className="text-sm">{feature.timing}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1.5">Recommendation</span>
                              <div className="flex items-center">
                                <span className="text-sm max-w-[250px] truncate" title={feature.recommendation}>
                                  {feature.recommendation}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

// Search icon component for the input
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
