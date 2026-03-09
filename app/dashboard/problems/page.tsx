"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Truck,
  Wrench,
  Calendar,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const problems = [
  {
    id: "PRB-001",
    device: "Dell OptiPlex 7090",
    deviceType: "PC",
    reportedBy: "John Doe",
    status: "Open",
    date: "2024-03-15",
    assignedOperator: "Mike Tech",
    description: "Screen flickering intermittently",
  },
  {
    id: "PRB-002",
    device: "HP EliteBook 840",
    deviceType: "Laptop",
    reportedBy: "Jane Smith",
    status: "In Progress",
    date: "2024-03-14",
    assignedOperator: "Sarah Admin",
    description: "Battery not charging properly",
  },
  {
    id: "PRB-003",
    device: "Canon imageRUNNER C3226i",
    deviceType: "Printer",
    reportedBy: "IT Department",
    status: "Shipped",
    date: "2024-03-12",
    assignedOperator: "Mike Tech",
    description: "Paper jam and error codes",
  },
  {
    id: "PRB-004",
    device: "LG 27UK850-W",
    deviceType: "Monitor",
    reportedBy: "Mike Johnson",
    status: "Resolved",
    date: "2024-03-10",
    assignedOperator: "Sarah Admin",
    description: "Dead pixels on display",
  },
  {
    id: "PRB-005",
    device: "Lenovo ThinkCentre M920",
    deviceType: "PC",
    reportedBy: "Emma Wilson",
    status: "Open",
    date: "2024-03-15",
    assignedOperator: "Unassigned",
    description: "System runs very slow",
  },
  {
    id: "PRB-006",
    device: "Apple MacBook Pro 14",
    deviceType: "Laptop",
    reportedBy: "Sarah Wilson",
    status: "In Progress",
    date: "2024-03-13",
    assignedOperator: "Mike Tech",
    description: "Keyboard keys not responding",
  },
]

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return {
        icon: AlertCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      }
    case "in progress":
      return {
        icon: Wrench,
        color: "text-warning",
        bgColor: "bg-warning/10",
      }
    case "shipped":
      return {
        icon: Truck,
        color: "text-primary",
        bgColor: "bg-primary/10",
      }
    case "resolved":
      return {
        icon: CheckCircle2,
        color: "text-success",
        bgColor: "bg-success/10",
      }
    default:
      return {
        icon: Clock,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
      }
  }
}

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || problem.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesType =
      typeFilter === "all" || problem.deviceType.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Problems</h1>
          <p className="text-muted-foreground">Track and manage all reported issues</p>
        </div>
        <Link href="/dashboard/problems/new">
          <Button>
            <AlertCircle className="mr-2 h-4 w-4" />
            Report Problem
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Device Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pc">PC</SelectItem>
              <SelectItem value="laptop">Laptop</SelectItem>
              <SelectItem value="printer">Printer</SelectItem>
              <SelectItem value="monitor">Monitor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem ID</TableHead>
              <TableHead>Device</TableHead>
              <TableHead className="hidden md:table-cell">Reported By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.map((problem) => {
              const statusInfo = getStatusInfo(problem.status)
              const StatusIcon = statusInfo.icon
              return (
                <TableRow key={problem.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-sm font-medium">{problem.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{problem.device}</p>
                      <p className="text-sm text-muted-foreground">{problem.deviceType}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {problem.reportedBy}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "flex w-fit items-center gap-1",
                        statusInfo.bgColor,
                        statusInfo.color,
                        `hover:${statusInfo.bgColor}`
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {problem.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {problem.date}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {problem.assignedOperator}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/problems/${problem.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredProblems.length} of {problems.length} problems</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
