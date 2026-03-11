"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Monitor,
  User,
  AlertCircle,
  Wrench,
  Truck,
  CheckCircle2,
  MessageSquare,
  Send,
  Clock,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useProbleme } from "@/lib/hooks/use-api"
import { problemesApi, messagesApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { mutate } from "swr"
import type { ProblemeStatus } from "@/lib/api"

const formatStatus = (status: ProblemeStatus) => {
  switch (status) {
    case "DECLARED":           return "Declared"
    case "UNDER_VERIFICATION": return "Under Verification"
    case "SENT_TO_COMPANY":    return "Sent to Company"
    case "REPAIRED":           return "Repaired"
    case "REPLACED":           return "Replaced"
    case "CLOSED":             return "Closed"
    default:                   return status
  }
}

const getStatusBadge = (status: ProblemeStatus) => {
  switch (status) {
    case "DECLARED":
      return <Badge className="bg-destructive/10 text-destructive"><AlertCircle className="mr-1 h-3 w-3" />{formatStatus(status)}</Badge>
    case "UNDER_VERIFICATION":
      return <Badge className="bg-warning/10 text-warning"><Clock className="mr-1 h-3 w-3" />{formatStatus(status)}</Badge>
    case "SENT_TO_COMPANY":
      return <Badge className="bg-primary/10 text-primary"><Truck className="mr-1 h-3 w-3" />{formatStatus(status)}</Badge>
    case "REPAIRED":
    case "REPLACED":
      return <Badge className="bg-success/10 text-success"><Wrench className="mr-1 h-3 w-3" />{formatStatus(status)}</Badge>
    case "CLOSED":
      return <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" />{formatStatus(status)}</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getInitials = (name?: string) =>
  (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export default function ProblemeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token, user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const parsedId = id ? parseInt(id) : undefined
  const { data: probleme, isLoading, error } = useProbleme(parsedId)

  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [newStatus, setNewStatus] = useState<ProblemeStatus | "">("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [diagnostic, setDiagnostic] = useState("")

  // Set mounted flag on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    if (!isLoading && isMounted) {
      console.log("ProblemeDetailPage Debug:", {
        id,
        parsedId,
        token: token ? "present" : "missing",
        probleme: probleme ? "loaded" : "not loaded",
        error: error ? error : "no error",
        isLoading,
      })
    }
  }, [id, parsedId, token, probleme, error, isLoading, isMounted])

  const handleSendMessage = async () => {
    if (!token || !probleme || !newMessage.trim()) return
    // Need a receiver — send to declaredBy if current user is not them, else to operator
    const receiverId =
      user?.id !== probleme.declared_by_user_id
        ? probleme.declared_by_user_id
        : probleme.interventions?.[0]?.operator_id ?? probleme.declared_by_user_id

    setIsSending(true)
    try {
      await messagesApi.send(
        { probleme_id: probleme.id, receiver_id: receiverId, message: newMessage.trim() },
        token
      )
      mutate(["probleme", probleme.id, token])
      setNewMessage("")
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!token || !probleme || !newStatus) return
    setIsUpdatingStatus(true)
    try {
      await problemesApi.updateStatus(probleme.id, newStatus as ProblemeStatus, token)
      mutate(["probleme", probleme.id, token])
      mutate(["problemes", token])
      setNewStatus("")
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Detailed error handling
  const getErrorMessage = () => {
    if (!id) return "Problem ID is missing from URL"
    if (isNaN(parsedId || NaN)) return `Invalid problem ID: "${id}"`
    if (!token) return "You are not authenticated. Please log in."
    if (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      return `Failed to load problem: ${errorMsg}`
    }
    if (!probleme) return "Problem not found in database"
    return "Unknown error"
  }

  if (error || !probleme) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
          <h3 className="font-semibold mb-2">Failed to Load Problem</h3>
          <p className="text-sm mb-3">{getErrorMessage()}</p>
          <div className="text-xs space-y-1">
            <p>Debug info: ID="{id}", Token={token ? "✓" : "✗"}</p>
          </div>
        </div>
        <Link href="/dashboard/problems">
          <Button variant="outline">← Back to Problems</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/problemes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Problème #{probleme.id}
            </h1>
            {getStatusBadge(probleme.status)}
          </div>
          <p className="text-muted-foreground">
            Reported on {new Date(probleme.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

          {/* Problem Description */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-card-foreground">Problem Description</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">{probleme.description}</p>
          </div>

          {/* Interventions */}
          {probleme.interventions && probleme.interventions.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-card-foreground">Interventions</h3>
              <div className="mt-4 space-y-4">
                {probleme.interventions.map((intervention) => (
                  <div key={intervention.id} className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Intervention #{intervention.id}
                      </span>
                      {intervention.resultat && (
                        <Badge className="bg-success/10 text-success">{intervention.resultat}</Badge>
                      )}
                    </div>
                    {intervention.diagnostic && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Diagnostic: </span>
                        {intervention.diagnostic}
                      </p>
                    )}
                    {intervention.operator && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Operator: </span>
                        {intervention.operator.name}
                      </p>
                    )}
                    {intervention.date_intervention && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(intervention.date_intervention).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
                <MessageSquare className="h-5 w-5" />
                Messages
              </h3>
            </div>
            <div className="divide-y divide-border">
              {(!probleme.messages || probleme.messages.length === 0) ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No messages yet</p>
              ) : (
                probleme.messages.map((msg) => (
                  <div key={msg.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(msg.sender?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{msg.sender?.name ?? `User #${msg.sender_id}`}</span>
                          <Badge variant="outline" className="text-xs">{msg.sender?.role ?? "User"}</Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground">{msg.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-border p-4">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="mt-2 flex justify-end">
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                  {isSending
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <Send className="mr-2 h-4 w-4" />}
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Materiel Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
              <Monitor className="h-5 w-5" />
              Matériel Information
            </h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Type</dt>
                <dd className="text-sm font-medium text-foreground">{probleme.materiel?.type ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Marque</dt>
                <dd className="text-sm font-medium text-foreground">{probleme.materiel?.marque ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Modèle</dt>
                <dd className="text-sm font-medium text-foreground">{probleme.materiel?.modele ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">N° Inventaire</dt>
                <dd className="font-mono text-sm text-foreground">{probleme.materiel?.numero_inventaire ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">N° Série</dt>
                <dd className="font-mono text-sm text-foreground">{probleme.materiel?.numero_serie ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Code ONEE</dt>
                <dd className="font-mono text-sm text-foreground">{probleme.materiel?.code_onee ?? "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Reported By */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
              <User className="h-5 w-5" />
              Reported By
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(probleme.declaredBy?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{probleme.declaredBy?.name ?? `User #${probleme.declared_by_user_id}`}</p>
                <p className="text-sm text-muted-foreground">{probleme.declaredBy?.email ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Operator Actions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
              <Wrench className="h-5 w-5" />
              Update Status
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">New Status</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ProblemeStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DECLARED">Declared</SelectItem>
                    <SelectItem value="UNDER_VERIFICATION">Under Verification</SelectItem>
                    <SelectItem value="SENT_TO_COMPANY">Sent to Company</SelectItem>
                    <SelectItem value="REPAIRED">Repaired</SelectItem>
                    <SelectItem value="REPLACED">Replaced</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleUpdateStatus}
                disabled={!newStatus || isUpdatingStatus}
              >
                {isUpdatingStatus
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Update Status
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}