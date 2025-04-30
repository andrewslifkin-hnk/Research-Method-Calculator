import type React from "react"
import { isSupabaseAvailable } from "@/utils/supabase"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

// Check Supabase availability on app initialization
isSupabaseAvailable()
  .then((available) => {
    console.log(`Supabase availability check on app init: ${available ? "Available" : "Not available"}`)
  })
  .catch((err) => {
    console.error("Error checking Supabase on app init:", err)
  })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
