"use client"

import { useState, useEffect } from "react"
import {
  Settings, User, Bell, Shield, Palette,
  Mail, Save, Eye, EyeOff, Loader2, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

function StatusMessage({ status }: { status: { type: "success" | "error"; text: string } | null }) {
  if (!status) return null
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
      status.type === "success"
        ? "bg-green-500/10 text-green-600 dark:text-green-400"
        : "bg-destructive/10 text-destructive"
    }`}>
      {status.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
      {status.text}
    </div>
  )
}

export default function SettingsPage() {
  const { token } = useAuth()

  // Profile
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileStatus, setProfileStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    problemUpdates: true,
    interventionUpdates: true,
    deviceAssignments: true,
    newMessages: true,
    systemAnnouncements: false,
  })
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifStatus, setNotifStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Appearance
  const [theme, setTheme] = useState("system")
  const [appearanceLoading, setAppearanceLoading] = useState(false)
  const [appearanceStatus, setAppearanceStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load on mount
  useEffect(() => {
    if (!token) return
    fetch(`${API}/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return
        setName(data.profile.name || "")
        setEmail(data.profile.email || "")
        if (data.preferences?.notifications) setNotifications(data.preferences.notifications)
        if (data.preferences?.appearance?.theme) setTheme(data.preferences.appearance.theme)
      })
      .catch(console.error)
  }, [token])

  const saveProfile = async () => {
    setProfileLoading(true)
    setProfileStatus(null)
    try {
      const res = await fetch(`${API}/settings/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setProfileStatus({ type: "success", text: "Profile updated successfully." })
    } catch (err: any) {
      setProfileStatus({ type: "error", text: err.message || "Failed to update profile." })
    } finally {
      setProfileLoading(false)
    }
  }

  const savePassword = async () => {
    setPasswordStatus(null)
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", text: "Passwords do not match." })
      return
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", text: "Password must be at least 8 characters." })
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch(`${API}/settings/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPasswordStatus({ type: "success", text: "Password updated successfully." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordStatus({ type: "error", text: err.message || "Failed to update password." })
    } finally {
      setPasswordLoading(false)
    }
  }

  const saveNotifications = async () => {
    setNotifLoading(true)
    setNotifStatus(null)
    try {
      const res = await fetch(`${API}/settings/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notifications }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setNotifStatus({ type: "success", text: "Notification preferences saved." })
    } catch (err: any) {
      setNotifStatus({ type: "error", text: err.message || "Failed to save preferences." })
    } finally {
      setNotifLoading(false)
    }
  }

  

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /><span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /><span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /><span className="hidden sm:inline">Security</span>
          </TabsTrigger>
         
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-card-foreground">Profile Information</h3>
              <p className="mt-1 text-sm text-muted-foreground">Update your name and email address</p>
            </div>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <StatusMessage status={profileStatus} />
              <Button onClick={saveProfile} disabled={profileLoading}>
                {profileLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-card-foreground">Notification Preferences</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose how and when you want to be notified</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications((n) => ({ ...n, email: v }))} />
              </div>
              <Separator />
              <div className="space-y-4">
                <p className="font-medium text-foreground">Notify me about:</p>
                <div className="space-y-3">
                  {[
                    { key: "problemUpdates", label: "Problem status updates" },
                    { key: "interventionUpdates", label: "Intervention updates" },
                    { key: "deviceAssignments", label: "Device assignments" },
                    { key: "newMessages", label: "New messages" },
                    { key: "systemAnnouncements", label: "System announcements" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <Switch
                        checked={notifications[key as keyof typeof notifications]}
                        onCheckedChange={(v) => setNotifications((n) => ({ ...n, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <StatusMessage status={notifStatus} />
              <Button onClick={saveNotifications} disabled={notifLoading}>
                {notifLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                  : <><Save className="mr-2 h-4 w-4" />Save Preferences</>}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-semibold text-card-foreground">Change Password</h3>
              <p className="mt-1 text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </div>
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type={showPassword ? "text" : "password"}
                  placeholder="Enter new password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <StatusMessage status={passwordStatus} />
              <Button onClick={savePassword} disabled={passwordLoading}>
                {passwordLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                  : "Update Password"}
              </Button>
            </div>
          </div>
        </TabsContent>

       
      </Tabs>
    </div>
  )
}