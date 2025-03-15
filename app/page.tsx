"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // If authentication state is loaded
    if (!loading) {
      // Redirect to my-schedule if authenticated, otherwise to login
      const redirectPath = isAuthenticated ? "/my-schedule" : "/login"
      router.push(redirectPath)
    }
  }, [router, isAuthenticated, loading])

  // Return a minimal loading state while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}

