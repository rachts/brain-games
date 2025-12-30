"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await signup(email, password, displayName)
      toast.success("Account created successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="glass p-8 rounded-2xl space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Join Brain Games</h1>
              <p className="text-muted-foreground">Create your account and start training</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
