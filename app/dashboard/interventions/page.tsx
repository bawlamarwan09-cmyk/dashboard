"use client"

import { useState } from "react"
import {
  Wrench,
  Truck,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  Filter,
  Building2,
  User,
  Package,
  RefreshCw,
  ArrowRightLeft,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const interventions = [
  {
    id: "INT-001",
    problemId: "PRB-001",
    device: "Dell OptiPlex 7090",
    operator: "Mike Tech",
    company: null,
    type: "Internal",
    status: "In Progress",
    startDate: "2024-03-15",
    returnDate: null,
    shipmentRef: null,
    result: null,
  },
  {
    id: "INT-002",
    problemId: "PRB-003",
    device: "Canon imageRUNNER C3226i",
    operator: "Mike Tech",
    company: "Canon Service Center",
    type: "External",
    status: "Shipped",
    startDate: "2024-03-12",
    returnDate: "2024-03-20",
    shipmentRef: "SHIP-2024-0342",
    result: null,
  },
  {
    id: "INT-003",
    problemId: "PRB-004",
    device: "LG 27UK850-W",
    operator: "Sarah Admin",
    company: null,
    type: "Replacement",
    status: "Completed",
    startDate: "2024-03-10",
    returnDate: "2024-03-11",
    shipmentRef: null,
    result: "Replaced",
  },
  {
    id: "INT-004",
    problemId: "PRB-002",
    device: "HP EliteBook 840",
    operator: "Sarah Admin",
    company: "HP Support",
    type: "External",
    status: "Returned",
    startDate: "2024-03-08",
    returnDate: "2024-03-14",
    shipmentRef: "SHIP-2024-0298",
    result: "Repaired",
  },
  {
    id: "INT-005",
    problemId: "PRB-006",
    device: "Apple MacBook Pro 14",
    operator: "Mike Tech",
    company: "Apple Authorized Service",
    type: "External",
    status: "Shipped",
    startDate: "2024-03-13",
    returnDate: "2024-03-25",
    shipmentRef: "SHIP-2024-0356",
    result: null,
  },
]

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
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
    case "returned":
      return (
        <Badge className="bg-chart-5/10 text-chart-5 hover:bg-chart-5/20">
          <Package className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      )
    case "completed":
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

const getTypeBadge = (type: string) => {
  switch (type.toLowerCase()) {
    case "internal":
      return <Badge variant="outline">Internal Repair</Badge>
    case "external":
      return (
        <Badge variant="outline" className="border-primary/50 text-primary">
          External Service
        </Badge>
      )
    case "replacement":
      return (
        <Badge variant="outline" className="border-warning/50 text-warning">
          Replacement
        </Badge>
      )
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

const getResultBadge = (result: string | null) => {
  if (!result) return <span className="text-muted-foreground">Pending</span>
  switch (result.toLowerCase()) {
    case "repaired":
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Repaired
        </Badge>
      )
    case "replaced":
      return (
        <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
          <RefreshCw className="mr-1 h-3 w-3" />
          Replaced
        </Badge>
      )
    case "not repairable":
      return (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
          <XCircle className="mr-1 h-3 w-3" />
          Not Repairable
        </Badge>
      )
    default:
      return <Badge variant="secondary">{result}</Badge>
  }
}

export default function InterventionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIntervention, setSelectedIntervention] = useState<typeof interventions[0] | null>(null)

  const filteredInterventions = interventions.filter((intervention) => {
    const matchesSearch =
      intervention.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.operator.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || intervention.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Interventions</h1>
        <p className="text-muted-foreground">Track repair and replacement activities</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="internal">Internal</TabsTrigger>
          <TabsTrigger value="external">External</TabsTrigger>
          <TabsTrigger value="replacements">Replacements</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search interventions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Operator</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead className="hidden xl:table-cell">Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterventions.map((intervention) => (
                  <TableRow key={intervention.id}>
                    <TableCell className="font-mono text-sm">{intervention.id}</TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{intervention.device}</p>
                      <p className="text-xs text-muted-foreground">{intervention.problemId}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getTypeBadge(intervention.type)}
                    </TableCell>
                    <TableCell>{getStatusBadge(intervention.status)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {intervention.operator}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {intervention.company ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          <span className="max-w-[120px] truncate">{intervention.company}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {getResultBadge(intervention.result)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedIntervention(intervention)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Intervention Details</DialogTitle>
                            <DialogDescription>
                              {intervention.id} - {intervention.device}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Status</p>
                                {getStatusBadge(intervention.status)}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Type</p>
                                {getTypeBadge(intervention.type)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Operator</p>
                                <p className="font-medium text-foreground">{intervention.operator}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Company</p>
                                <p className="font-medium text-foreground">
                                  {intervention.company || "-"}
                                </p>
                              </div>
                            </div>
                            {intervention.shipmentRef && (
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Shipment Reference</p>
                                <p className="font-mono text-foreground">{intervention.shipmentRef}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="flex items-center gap-1 text-foreground">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {intervention.startDate}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Return Date</p>
                                <p className="flex items-center gap-1 text-foreground">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {intervention.returnDate || "Pending"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Result</p>
                              {getResultBadge(intervention.result)}
                            </div>

                            {intervention.result === "Replaced" && (
                              <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                                  <ArrowRightLeft className="h-4 w-4" />
                                  Replacement Details
                                </h4>
                                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Old Device</p>
                                    <p className="font-medium text-foreground">{intervention.device}</p>
                                    <p className="font-mono text-xs text-muted-foreground">INV-2024-032</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">New Device</p>
                                    <p className="font-medium text-foreground">LG 27UK850-W (New)</p>
                                    <p className="font-mono text-xs text-muted-foreground">INV-2024-089</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="internal" className="mt-0">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">Internal Repairs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              View interventions handled by internal IT staff
            </p>
          </div>
        </TabsContent>

        <TabsContent value="external" className="mt-0">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">External Services</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Track devices sent to external service providers
            </p>
          </div>
        </TabsContent>

        <TabsContent value="replacements" className="mt-0">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">Device Replacements</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              View history of device replacements
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
