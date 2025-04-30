import DecisionMatrix from "@/decision-matrix"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ReferencePage() {
  return (
    <main className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Feature Analysis
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center">Decision Matrix Reference</h1>
        <p className="text-muted-foreground text-center mb-8">
          Complete reference table showing recommended research methods based on feature attributes
        </p>

        <DecisionMatrix />
      </div>
    </main>
  )
}
