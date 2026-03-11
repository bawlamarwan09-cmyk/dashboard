"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Clock,
  Loader2,
  Truck,
  Wrench,
  CheckCircle2,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProblemes } from "@/lib/hooks/use-api"
import type { ProblemeStatus } from "@/lib/api"

const formatStatus = (status: ProblemeStatus) => {
  switch (status) {
    case "DECLARED":
      return "Declared"
    case "UNDER_VERIFICATION":
      return "Under Verification"
    case "SENT_TO_COMPANY":
      return "Sent to Company"
    case "REPAIRED":
      return "Repaired"
    case "REPLACED":
      return "Replaced"
    case "CLOSED":
      return "Closed"
    default:
      return status
  }
}

const getStatusBadge = (status: ProblemeStatus) => {
  switch (status) {
    case "DECLARED":
      return (
        <Badge className="bg-destructive/10 text-destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          {formatStatus(status)}
        </Badge>
      )
    case "UNDER_VERIFICATION":
      return (
        <Badge className="bg-warning/10 text-warning">
          <Clock className="mr-1 h-3 w-3" />
          {formatStatus(status)}
        </Badge>
      )
    case "SENT_TO_COMPANY":
      return (
        <Badge className="bg-primary/10 text-primary">
          <Truck className="mr-1 h-3 w-3" />
          {formatStatus(status)}
        </Badge>
      )
    case "REPAIRED":
    case "REPLACED":
      return (
        <Badge className="bg-success/10 text-success">
          <Wrench className="mr-1 h-3 w-3" />
          {formatStatus(status)}
        </Badge>
      )
    case "CLOSED":
      return (
        <Badge className="bg-success/10 text-success">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {formatStatus(status)}
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ProblemsPage() {
  const { data: problemes, isLoading, error } = useProblemes()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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

  const filtered = (problemes || []).filter((p) => {
    const matchesSearch =
      p.id.toString().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Problems
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track IT equipment problems
          </p>
        </div>
        <Link href="/dashboard/problems/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Problem
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DECLARED">Declared</SelectItem>
              <SelectItem value="UNDER_VERIFICATION">Under Verification</SelectItem>
              <SelectItem value="SENT_TO_COMPANY">Sent to Company</SelectItem>
              <SelectItem value="REPAIRED">Repaired</SelectItem>
              <SelectItem value="REPLACED">Replaced</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No problems found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-mono text-sm">
                      #{problem.id}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {problem.description}
                    </TableCell>
                    <TableCell>{getStatusBadge(problem.status)}</TableCell>
                    <TableCell className="text-sm">
                      {problem.declaredBy?.name ?? `User #${problem.declared_by_user_id}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(problem.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/problems/${problem.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {problemes?.length || 0} problems
      </div>
    </div>
  )
}
