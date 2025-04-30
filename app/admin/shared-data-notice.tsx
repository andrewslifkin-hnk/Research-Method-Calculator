import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Database } from "lucide-react"

interface SharedDataNoticeProps {
  supabaseAvailable?: boolean
}

export function SharedDataNotice({ supabaseAvailable = false }: SharedDataNoticeProps) {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-600">Data Storage Information</AlertTitle>
      <AlertDescription className="text-blue-600">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>
            {supabaseAvailable
              ? "Matrix data is stored in Supabase database. This data is shared across all users of the application."
              : "Matrix data is currently stored in your browser's local storage. This means the data will persist in your current browser but won't be shared across devices or other users."}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export function StorageStatusNotice() {
  return null // We're now using the SharedDataNotice component with the supabaseAvailable prop
}
