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
  Loader2,
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
import { useProblems } from "@/lib/hooks/use-api"

const getStatusInfo = (status: string) => {
  switch (status?.toLowerCase()) {
    case "open":
      return {
        icon: AlertCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      }
    case "in_progress":
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
    case "closed":
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

const formatStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case "in_progress":
      return "In Progress"
    default:
      return status?.charAt(0).toUpperCase() + status?.slice(1)
  }
}

export default function ProblemsPage() {
  const { data: problems, isLoading, error } = useProblems()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        Failed to load problems. Please try again.
      </div>
    )
  }

  const problemList = problems || []

  const filteredProblems = problemList.filter((problem) => {
    const matchesSearch =
      problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.reportedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || problem.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority =
      priorityFilter === "all" || problem.priority?.toLowerCase() === priorityFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesPriority
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
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem ID</TableHead>
              <TableHead>Title / Device</TableHead>
              <TableHead className="hidden md:table-cell">Reported By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No problems found
                </TableCell>
              </TableRow>
            ) : (
              filteredProblems.map((problem) => {
                const statusInfo = getStatusInfo(problem.status)
                const StatusIcon = statusInfo.icon
                return (
                  <TableRow key={problem.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-medium">{problem.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{problem.title}</p>
                        <p className="text-sm text-muted-foreground">{problem.deviceName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {problem.reportedByName}
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
                        {formatStatus(problem.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {problem.assignedToName || "Unassigned"}
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredProblems.length} of {problemList.length} problems</p>
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
