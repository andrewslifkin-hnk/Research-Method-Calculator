"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLink() {
  const [clicks, setClicks] = useState(0)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Only show the admin link after 5 clicks or if already authenticated
  const handleClick = () => {
    setClicks(clicks + 1)
    if (clicks >= 4 || isAuthenticated) {
      router.push("/admin")
    }
  }

  return (
    <div className="text-center mt-8 text-xs text-muted-foreground">
      <span onClick={handleClick} className="cursor-default">
        Feature Prioritization Tool v1.0
      </span>
      {(clicks >= 3 || isAuthenticated) && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 h-6 w-6 p-0 rounded-full"
          onClick={() => router.push("/admin")}
        >
          <Settings className="h-3 w-3" />
          <span className="sr-only">Admin</span>
        </Button>
      )}
    </div>
  )
}
