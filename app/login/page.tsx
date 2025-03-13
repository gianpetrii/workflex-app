"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // Sign in with Firebase
      await signIn(email, password)

      toast({
        title: "Login successful!",
        description: "Redirecting to your schedule...",
      })

      router.push("/my-schedule")
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Handle specific Firebase auth errors
      const errorCode = error.code
      let errorMessage = "Invalid email or password. Please try again."
      
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        errorMessage = "Invalid email or password. Please try again."
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later."
      } else if (errorCode === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support."
      }
      
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    setError("")

    try {
      await signInWithGoogle()
      
      toast({
        title: "Login successful!",
        description: "Redirecting to your schedule...",
      })
      
      router.push("/my-schedule")
    } catch (error: any) {
      console.error("Google login error:", error)
      
      let errorMessage = "Failed to sign in with Google. Please try again."
      
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to WorkFlex</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your work schedule</p>
        </div>
        <Card className="w-full">
          <form onSubmit={onSubmit}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required disabled={isLoading} />
                </div>
                {error && (
                  <div className="text-sm text-red-500">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full" type="submit" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "Signing in..." : "Sign in with Email"}
              </Button>
              
              <div className="relative my-4 w-full">
                <Separator className="my-4" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  OR
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
              </Button>
              
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

