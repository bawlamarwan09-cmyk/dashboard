"use client"

import { useState } from "react"
import {
  Search,
  Send,
  User,
  Building2,
  Wrench,
  MoreVertical,
  Phone,
  Mail,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const conversations = [
  {
    id: 1,
    name: "Mike Tech",
    role: "Operator",
    avatar: "MT",
    lastMessage: "I'll check the GPU temperature and run diagnostics.",
    time: "2 min ago",
    unread: 2,
    online: true,
    problemId: "PRB-001",
  },
  {
    id: 2,
    name: "Canon Service Center",
    role: "Company",
    avatar: "CS",
    lastMessage: "The device is ready for pickup. Invoice attached.",
    time: "1 hour ago",
    unread: 1,
    online: false,
    problemId: "PRB-003",
  },
  {
    id: 3,
    name: "Sarah Admin",
    role: "Operator",
    avatar: "SA",
    lastMessage: "Your monitor replacement has been processed.",
    time: "3 hours ago",
    unread: 0,
    online: true,
    problemId: "PRB-004",
  },
  {
    id: 4,
    name: "HP Support",
    role: "Company",
    avatar: "HP",
    lastMessage: "We received the laptop. Estimated repair time: 5-7 days.",
    time: "Yesterday",
    unread: 0,
    online: false,
    problemId: "PRB-002",
  },
  {
    id: 5,
    name: "IT Support Team",
    role: "Operator",
    avatar: "IT",
    lastMessage: "Welcome! How can we help you today?",
    time: "2 days ago",
    unread: 0,
    online: true,
    problemId: null,
  },
]

const messages = [
  {
    id: 1,
    senderId: "user",
    content: "Hi, I reported a problem with my PC - the screen keeps flickering.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    senderId: "operator",
    content: "Hello John! I've received your ticket PRB-001. I'll look into it right away. Can you tell me when the flickering started?",
    timestamp: "10:32 AM",
  },
  {
    id: 3,
    senderId: "user",
    content: "It started about a week ago. It seems to happen more when I'm running heavy applications.",
    timestamp: "10:35 AM",
  },
  {
    id: 4,
    senderId: "operator",
    content: "Thanks for the info. That could indicate a GPU issue or possibly a loose cable. I'll schedule a time to check it. Are you available this afternoon?",
    timestamp: "10:38 AM",
  },
  {
    id: 5,
    senderId: "user",
    content: "Yes, I'll be at my desk all afternoon. Thanks for the quick response!",
    timestamp: "10:40 AM",
  },
  {
    id: 6,
    senderId: "operator",
    content: "I'll check the GPU temperature and run diagnostics. See you at 2 PM.",
    timestamp: "10:42 AM",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "operator":
        return <Wrench className="h-3 w-3" />
      case "company":
        return <Building2 className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Would send message to API
      setNewMessage("")
    }
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
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                  selectedConversation.id === conversation.id && "bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/${conversation.avatar.toLowerCase()}.png`} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {conversation.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{conversation.name}</span>
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="h-5 px-1 text-xs">
                      {getRoleIcon(conversation.role)}
                    </Badge>
                    {conversation.problemId && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {conversation.problemId}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread > 0 && (
                  <Badge className="h-5 w-5 rounded-full p-0 text-xs">
                    {conversation.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/avatars/${selectedConversation.avatar.toLowerCase()}.png`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedConversation.avatar}
                </AvatarFallback>
              </Avatar>
              {selectedConversation.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{selectedConversation.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {selectedConversation.role}
                </Badge>
              </div>
              {selectedConversation.problemId && (
                <p className="text-sm text-muted-foreground">
                  Re: {selectedConversation.problemId}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Mail className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>View Problem</DropdownMenuItem>
                <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex justify-center">
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                Today
              </span>
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.senderId === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    message.senderId === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs",
                      message.senderId === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
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
                  handleSendMessage()
                }
              }}
            />
            <Button onClick={handleSendMessage} className="h-auto">
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
