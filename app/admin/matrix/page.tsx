"use client"

import { useAuth } from "@/contexts/auth-context"
import AdminLogin from "@/components/admin-login"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut } from "lucide-react"
import dynamic from "next/dynamic"
import { Sidebar, SidebarBody, SidebarLink, SidebarProvider } from "@/components/ui/sidebar"
import { LayoutDashboard, Settings, Home } from "lucide-react"

// Dynamically import the MatrixAdminContent component to avoid hydration issues
const MatrixAdminContent = dynamic(() => import("@/components/matrix-admin-content"), { ssr: false })

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
    <SidebarProvider>
      <div className="flex min-h-screen bg-white text-neutral-900">
        <Sidebar>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mt-8 flex flex-col gap-2">
                {sidebarLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
              
              {/* Add separator and back to app navigation */}
              <div className="mt-auto pt-8 border-t border-neutral-200 my-4">
                {navigationLinks.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 bg-white min-h-screen">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Matrix Data Settings</h1>
              <Button variant="ghost" size="sm" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            <MatrixAdminContent />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
