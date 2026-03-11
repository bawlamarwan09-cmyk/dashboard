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

const groupByProbleme = (messages: Message[], currentUserId: number) => {
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
  const conversations = user ? groupByProbleme(uniqueMessages, user.id) : []

  const filteredConversations = conversations.filter((c) =>
    c.other?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(c.problemeId).includes(searchQuery)
  )

  const selectedConv = conversations.find(c => c.problemeId === selectedProblemeId)

  const handleSend = async () => {
    if (!token || !newMessage.trim() || !selectedConv || !user) return
    setIsSending(true)
    try {
      await fetch(`http://localhost:5000/api/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          probleme_id: selectedConv.problemeId,
          receiver_id: selectedConv.other?.id,
          message: newMessage.trim(),
        }),
      })
      setNewMessage("")
      mutate(["messages-thread", selectedProblemeId, token])
      mutate(["messages-sent", token])
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
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations List */}
      <div className="flex w-80 flex-col rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-card-foreground">Messages</h2>
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
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.problemeId}
                  onClick={() => setSelectedProblemeId(conv.problemeId)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                    selectedProblemeId === conv.problemeId && "bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(conv.other?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{conv.other?.name ?? "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge variant="outline" className="h-5 px-1 text-xs">
                        {getRoleIcon(conv.other?.role)}
                        <span className="ml-1">{conv.other?.role}</span>
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{conv.problemeId}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
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
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
        {!selectedProblemeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Select a conversation</p>
            <p className="text-sm text-muted-foreground">Choose a conversation from the left to start messaging</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(selectedConv?.other?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{selectedConv?.other?.name}</h3>
                  <Badge variant="outline" className="text-xs">{selectedConv?.other?.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Problem #{selectedProblemeId}</p>
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
                    <p className="text-center text-sm text-muted-foreground py-8">No messages yet</p>
                  ) : (
                    (threadMessages || []).map((msg) => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          )}>
                            {!isMe && (
                              <p className="mb-1 text-xs font-medium opacity-70">{msg.sender?.name}</p>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <p className={cn(
                              "mt-1 flex items-center gap-1 text-xs",
                              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={!newMessage.trim() || isSending} className="h-auto">
                  {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}