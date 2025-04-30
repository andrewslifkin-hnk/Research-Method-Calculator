"use client"

import { useAuth } from "@/contexts/auth-context"
import AdminLogin from "@/components/admin-login"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the MatrixAdminContent component to avoid hydration issues
const MatrixAdminContent = dynamic(() => import("@/components/matrix-admin-content"), { ssr: false })

export default function AdminMatrixPage() {
  const { isAuthenticated, logout } = useAuth()

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
    <main className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <MatrixAdminContent />
      </div>
    </main>
  )
}
