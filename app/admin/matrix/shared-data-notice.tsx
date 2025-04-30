import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function SharedDataNotice() {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-600">Shared Data</AlertTitle>
      <AlertDescription>
        The matrix data you upload here will be available to all users of the application. This ensures everyone uses
        the same decision criteria without needing to upload their own data.
      </AlertDescription>
    </Alert>
  )
}
