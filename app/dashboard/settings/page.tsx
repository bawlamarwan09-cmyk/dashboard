"use client"

import { useState } from "react"
import {
  User, Mail, Lock, Eye, EyeOff, Shield,
  CheckCircle2, AlertCircle, Loader2, KeyRound, Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { usersApi, settingsApi } from "@/lib/api"
import { mutate } from "swr"

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name?: string) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getRoleBadgeStyle(role?: string) {
  switch (role) {
    case "ADMIN":    return "bg-destructive/10 text-destructive border-destructive/20"
    case "OPERATOR": return "bg-warning/10 text-warning border-warning/20"
    case "COMPANY":  return "bg-primary/10 text-primary border-primary/20"
    default:         return "bg-muted text-muted-foreground border-border"
  }
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Contains number", ok: /\d/.test(password) },
    { label: "Contains letter", ok: /[a-zA-Z]/.test(password) },
    { label: "Special character", ok: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const bars = ["bg-destructive", "bg-warning", "bg-warning", "bg-success"]
  const labels = ["", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? bars[score - 1] : "bg-border"
            }`}
          />
        ))}
        <span className={`text-xs font-medium ml-1 min-w-[40px] ${
          score <= 1 ? "text-destructive" :
          score <= 2 ? "text-warning" : "text-success"
        }`}>
          {labels[score]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <p key={c.label} className={`text-xs flex items-center gap-1.5 ${
            c.ok ? "text-success" : "text-muted-foreground"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              c.ok ? "bg-success" : "bg-border"
            }`} />
            {c.label}
          </p>
        ))}
      </div>
    </div>
  )
}

type Toast = { type: "success" | "error"; message: string }

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${
      toast.type === "success"
        ? "border-success/20 bg-success/10 text-success"
        : "border-destructive/20 bg-destructive/10 text-destructive"
    }`}>
      {toast.type === "success"
        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
        : <AlertCircle className="h-4 w-4 shrink-0" />
      }
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
    </div>
  )
}

// ── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, token, setUser } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const isDirty = name !== user?.name || email !== user?.email

  const showToast = (t: Toast) => {
    setToast(t)
    setTimeout(() => setToast(null), 4000)
  }

  const handleSave = async () => {
    if (!user || !token) return
    if (!name.trim()) return showToast({ type: "error", message: "Name cannot be empty." })
    if (!email.trim() || !email.includes("@")) return showToast({ type: "error", message: "Please enter a valid email." })

    setIsSaving(true)
    try {
      const updated = await usersApi.update(user.id, { name: name.trim(), email: email.trim() }, token)
      setUser?.(updated)
      mutate(["dashboard-stats", token])
      showToast({ type: "success", message: "Profile updated successfully." })
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "Failed to update profile." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar section */}
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
            {getInitials(name || user?.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground text-lg">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeStyle(user?.role)}`}>
              <Shield className="h-3 w-3" />
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Form */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
              placeholder="Your full name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Role</Label>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user?.role}</span>
            <span className="ml-auto text-xs text-muted-foreground">Assigned by administrator</span>
          </div>
          <p className="text-xs text-muted-foreground">Your role determines what you can access in the system.</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Member since</p>
          <p className="text-sm font-medium text-foreground">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// ── Security Tab ───────────────────────────────────────────────────────────

function SecurityTab() {
  const { user, token } = useAuth()
  const [current, setCurrent]       = useState("")
  const [newPass, setNewPass]       = useState("")
  const [confirm, setConfirm]       = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSaving, setIsSaving]     = useState(false)
  const [toast, setToast]           = useState<Toast | null>(null)

  const showToast = (t: Toast) => {
    setToast(t)
    setTimeout(() => setToast(null), 4000)
  }

  const handleChangePassword = async () => {
    if (!token) return
    if (!current)  return showToast({ type: "error", message: "Enter your current password." })
    if (newPass.length < 8) return showToast({ type: "error", message: "New password must be at least 8 characters." })
    if (newPass !== confirm) return showToast({ type: "error", message: "Passwords do not match." })
    if (current === newPass) return showToast({ type: "error", message: "New password must differ from current password." })

    setIsSaving(true)
    try {
      await settingsApi.updatePassword(current, newPass, token)
      setCurrent(""); setNewPass(""); setConfirm("")
      showToast({ type: "success", message: "Password changed successfully." })
    } catch (err: any) {
      showToast({ type: "error", message: err.message || "Failed to change password." })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* Security overview */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Account active</p>
            <p className="text-xs text-muted-foreground">Your account is in good standing</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Password auth</p>
            <p className="text-xs text-muted-foreground">Email + password login</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Change password form */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Change password</h3>
        <p className="text-xs text-muted-foreground mb-5">Choose a strong password you don't use elsewhere.</p>

        <div className="space-y-4 max-w-md">
          {/* Current password */}
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="current"
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="pl-9 pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="pl-9 pr-10"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={newPass} />
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`pl-9 pr-10 ${
                  confirm && confirm !== newPass ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                placeholder="Repeat new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirm && confirm !== newPass && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleChangePassword}
            disabled={isSaving || !current || !newPass || !confirm}
          >
            {isSaving
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating password...</>
              : <><KeyRound className="mr-2 h-4 w-4" />Update password</>
            }
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Session info</h3>
        <p className="text-xs text-muted-foreground mb-3">Your session token is valid for 7 days from last login.</p>
        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
          <Badge variant="outline" className="text-success border-success/30 bg-success/5">
            Active session
          </Badge>
        </div>
      </div>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

type Tab = "profile" | "security"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile",  label: "Profile",  icon: <User className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and security preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {activeTab === "profile"  && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
      </div>
    </div>
  )
}