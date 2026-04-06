"use client"

import { useState } from "react"
import {
  Search,
  Send,
  User,
  Building2,
  Wrench,
  Clock,
  Loader2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { messagesApi, usersApi } from "@/lib/api"
import useSWR, { mutate } from "swr"

type Message = {
  id: number
  probleme_id: number
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
  sender?: { id: number; name: string; role: string }
  receiver?: { id: number; name: string; role: string }
  probleme?: {
    id: number
    description: string
    status: string
    materiel?: { id: number; marque: string; modele: string }
  }
}

const getRoleIcon = (role?: string) => {
  switch (role?.toLowerCase()) {
    case "operator": return <Wrench className="h-3 w-3" />
    case "company":  return <Building2 className="h-3 w-3" />
    case "admin":    return <ShieldCheck className="h-3 w-3" />
    default:         return <User className="h-3 w-3" />
  }
}

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

const groupByProbleme = (messages: Message[], currentUserId: number, userRole?: string) => {
  const map = new Map<number, { problemeId: number; other: Message["sender"]; messages: Message[]; lastMessage: Message }>()

  for (const msg of messages) {
    const other = msg.sender_id === currentUserId ? msg.receiver : msg.sender
    const existing = map.get(msg.probleme_id)
    if (!existing) {
      map.set(msg.probleme_id, { problemeId: msg.probleme_id, other, messages: [msg], lastMessage: msg })
    } else {
      existing.messages.push(msg)
      if (new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
        existing.lastMessage = msg
      }
      // For USER role, prioritize OPERATOR as the contact, then ADMIN
      if (userRole === "USER" && other?.role === "OPERATOR") {
        existing.other = other
      } else if (userRole === "USER" && other?.role === "ADMIN" && existing.other?.role !== "OPERATOR") {
        existing.other = other
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  )
}

export default function MessagesPage() {
  const { token, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProblemeId, setSelectedProblemeId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Fetch inbox + sent combined
  const { data: inbox, isLoading: loadingInbox } = useSWR(
    token ? ["messages-inbox", token] : null,
    () => fetch(`http://localhost:5000/api/v1/messages/inbox`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => d.data as Message[])
  )

  const { data: sent } = useSWR(
    token ? ["messages-sent", token] : null,
    () => fetch(`http://localhost:5000/api/v1/messages/sent`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => d.data as Message[])
  )

  // Fetch messages for selected probleme
  const { data: threadMessages, isLoading: loadingThread } = useSWR(
    token && selectedProblemeId ? ["messages-thread", selectedProblemeId, token] : null,
    () => fetch(`http://localhost:5000/api/v1/messages/probleme/${selectedProblemeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => d.data as Message[])
  )

  const allMessages = [...(inbox || []), ...(sent || [])]
  const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values())
  const conversations = user ? groupByProbleme(uniqueMessages, user.id, user.role) : []

  const filteredConversations = conversations.filter((c) =>
    c.other?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(c.problemeId).includes(searchQuery)
  )

  const selectedConv = conversations.find(c => c.problemeId === selectedProblemeId)

  // Fetch contact info for the selected problem (for USER role or when no conversation exists)
  const { data: contactData } = useSWR(
    token && selectedProblemeId && (user?.role === "USER" || !selectedConv?.other)
      ? ["messages-contact", selectedProblemeId, token]
      : null,
    () => fetch(`http://localhost:5000/api/v1/messages/probleme/${selectedProblemeId}/contact`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => d.data)
  )

  const receiverId = selectedConv?.other?.id || contactData?.contact?.id
  const receiverName = selectedConv?.other?.name || contactData?.contact?.name
  const receiverRole = selectedConv?.other?.role || contactData?.contact?.role

  const handleSend = async () => {
    if (!token || !newMessage.trim() || !selectedProblemeId || !user || !receiverId) return
    setIsSending(true)
    try {
      await fetch(`http://localhost:5000/api/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          probleme_id: selectedProblemeId,
          receiver_id: receiverId,
          message: newMessage.trim(),
        }),
      })
      setNewMessage("")
      mutate(["messages-thread", selectedProblemeId, token])
      mutate(["messages-sent", token])
      mutate(["messages-inbox", token])
    } catch (err) {
      console.error("Send failed:", err)
    } finally {
      setIsSending(false)
    }
  }

  if (loadingInbox) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 p-4">
      {/* Conversations List */}
      <div className="flex w-80 flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border p-4 bg-gradient-to-r from-card to-muted/30">
          <h2 className="font-bold text-card-foreground text-lg">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.problemeId}
                  onClick={() => setSelectedProblemeId(conv.problemeId)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-all duration-200 hover:bg-muted/60",
                    selectedProblemeId === conv.problemeId && "bg-muted border-l-4 border-l-primary"
                  )}
                >
                  <Avatar className="h-12 w-12 shrink-0 ring-2 ring-border">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                      {getInitials(conv.other?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">{conv.other?.name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
                        {getRoleIcon(conv.other?.role)}
                        <span className="ml-1 capitalize">{conv.other?.role}</span>
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        #{conv.problemeId}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {conv.lastMessage.message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {!selectedProblemeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-8 bg-muted/30 rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">Select a conversation</p>
              <p className="text-sm text-muted-foreground max-w-xs">Choose a conversation from the left to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border p-4 bg-gradient-to-r from-card to-muted/20">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                  {getInitials(receiverName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-lg">{receiverName || "Loading..."}</h3>
                  {receiverRole && (
                    <Badge variant="secondary" className="text-xs font-medium capitalize">
                      {getRoleIcon(receiverRole)}
                      <span className="ml-1">{receiverRole}</span>
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Problem #{selectedProblemeId}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loadingThread ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(threadMessages || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Start the conversation by typing below</p>
                    </div>
                  ) : (
                    (threadMessages || []).map((msg) => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-card border border-border text-foreground rounded-bl-md"
                          )}>
                            {!isMe && (
                              <p className="mb-1.5 text-xs font-semibold text-primary">{msg.sender?.name}</p>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <div className={cn(
                              "mt-2 flex items-center gap-1.5 text-xs",
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4 bg-gradient-to-r from-muted/20 to-card">
              <div className="flex gap-3 items-end">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] resize-none rounded-xl border-border bg-background shadow-sm focus-visible:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isSending || !receiverId}
                  className="h-10 w-10 rounded-full p-0 shrink-0 shadow-md hover:shadow-lg transition-shadow"
                  title={!receiverId ? "No contact available for this problem" : "Send message"}
                >
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground pl-1">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}