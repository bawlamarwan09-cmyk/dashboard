"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.")
        return
      }

      setSubmitted(true)
    } catch {
      setError("Could not connect to the server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              If <span className="font-medium text-foreground">{email}</span> is registered,
              you'll receive a password reset link shortly.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-left text-xs text-muted-foreground space-y-1">
            <p>• The link expires in <strong>1 hour</strong></p>
            <p>• Check your spam folder if you don't see it</p>
            <p>• You can only use the link once</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmitted(false)
              setEmail("")
            }}
          >
            Try a different email
          </Button>
          <Link
            href="/login"
            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                className="pl-9"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}