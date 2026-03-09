"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Monitor,
  User,
  Calendar,
  AlertCircle,
  Wrench,
  Truck,
  CheckCircle2,
  MessageSquare,
  Send,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const problemData = {
  id: "PRB-001",
  device: {
    name: "Dell OptiPlex 7090",
    type: "PC",
    brand: "Dell",
    model: "OptiPlex 7090",
    inventoryNumber: "INV-2024-001",
    serialNumber: "D3LL7090X1234",
  },
  user: {
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
  },
  description:
    "The screen has been flickering intermittently for the past week. It happens randomly and sometimes the display goes completely black for a few seconds before coming back. This is affecting my work productivity.",
  status: "In Progress",
  createdAt: "2024-03-15 09:30 AM",
  assignedOperator: "Mike Tech",
}

const timeline = [
  {
    id: 1,
    type: "created",
    title: "Problem Reported",
    description: "John Doe reported this issue",
    timestamp: "Mar 15, 2024 09:30 AM",
    icon: AlertCircle,
    iconColor: "text-destructive bg-destructive/10",
  },
  {
    id: 2,
    type: "assigned",
    title: "Assigned to Mike Tech",
    description: "Problem assigned for investigation",
    timestamp: "Mar 15, 2024 10:15 AM",
    icon: User,
    iconColor: "text-primary bg-primary/10",
  },
  {
    id: 3,
    type: "progress",
    title: "Diagnosis Started",
    description: "Checking display cable and GPU connections",
    timestamp: "Mar 15, 2024 02:00 PM",
    icon: Wrench,
    iconColor: "text-warning bg-warning/10",
  },
]

const messages = [
  {
    id: 1,
    sender: "John Doe",
    role: "User",
    message: "The flickering seems to happen more often when the computer is under heavy load.",
    timestamp: "Mar 15, 2024 09:35 AM",
    avatar: "JD",
  },
  {
    id: 2,
    sender: "Mike Tech",
    role: "Operator",
    message:
      "Thanks for the additional info. I'll check the GPU temperature and run some diagnostic tests. Can you tell me which applications you're running when it happens?",
    timestamp: "Mar 15, 2024 10:20 AM",
    avatar: "MT",
  },
  {
    id: 3,
    sender: "John Doe",
    role: "User",
    message:
      "Usually Chrome with multiple tabs, VS Code, and sometimes Figma. It also happens during video calls.",
    timestamp: "Mar 15, 2024 10:45 AM",
    avatar: "JD",
  },
]

export default function ProblemDetailPage() {
  const [newMessage, setNewMessage] = useState("")
  const [action, setAction] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
            <AlertCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        )
      case "in progress":
        return (
          <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
            <Wrench className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        )
      case "shipped":
        return (
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
            <Truck className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        )
      case "resolved":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/problems">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {problemData.id}
            </h1>
            {getStatusBadge(problemData.status)}
          </div>
          <p className="text-muted-foreground">
            Reported on {problemData.createdAt}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Description */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-card-foreground">Problem Description</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {problemData.description}
            </p>
          </div>

          {/* Status Timeline */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-card-foreground">Status Timeline</h3>
            <div className="mt-4 space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        event.iconColor
                      )}
                    >
                      <event.icon className="h-5 w-5" />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="mt-2 h-full w-0.5 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Thread */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
                <MessageSquare className="h-5 w-5" />
                Messages
              </h3>
            </div>
            <div className="divide-y divide-border">
              {messages.map((message) => (
                <div key={message.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`/avatars/${message.avatar.toLowerCase()}.png`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{message.sender}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.role}
                        </Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground">{message.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{message.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="mt-2 flex justify-end">
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Device Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
              <Monitor className="h-5 w-5" />
              Device Information
            </h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Type</dt>
                <dd className="text-sm font-medium text-foreground">{problemData.device.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Brand</dt>
                <dd className="text-sm font-medium text-foreground">{problemData.device.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Model</dt>
                <dd className="text-sm font-medium text-foreground">{problemData.device.model}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Inventory #</dt>
                <dd className="font-mono text-sm text-foreground">
                  {problemData.device.inventoryNumber}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Serial #</dt>
                <dd className="font-mono text-sm text-foreground">
                  {problemData.device.serialNumber}
                </dd>
              </div>
            </dl>
          </div>

          {/* User Info */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
              <User className="h-5 w-5" />
              Reported By
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/jd.png" />
                <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{problemData.user.name}</p>
                <p className="text-sm text-muted-foreground">{problemData.user.email}</p>
                <p className="text-sm text-muted-foreground">{problemData.user.department}</p>
              </div>
            </div>
          </div>

          {/* Operator Actions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
              <Wrench className="h-5 w-5" />
              Operator Actions
            </h3>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Add Diagnosis</label>
                <Textarea placeholder="Enter diagnosis notes..." className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Choose Action</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">Repair Internally</SelectItem>
                    <SelectItem value="send">Send to Company</SelectItem>
                    <SelectItem value="replace">Replace Device</SelectItem>
                    <SelectItem value="resolve">Mark as Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Submit Action</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
