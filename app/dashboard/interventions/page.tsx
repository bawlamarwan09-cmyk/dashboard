"use client"

import { useState } from "react"
import {
  Wrench,
  Truck,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Building2,
  User,
  Package,
  RefreshCw,
  ArrowRightLeft,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInterventions } from "@/lib/hooks/use-api"
import type { Intervention, InterventionResult } from "@/lib/api"

const getResultBadge = (result?: InterventionResult | null) => {
  if (!result) return <span className="text-muted-foreground">Pending</span>
  switch (result) {
    case "REPAIRED":
      return <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" />Repaired</Badge>
    case "REPLACED":
      return <Badge className="bg-warning/10 text-warning"><RefreshCw className="mr-1 h-3 w-3" />Replaced</Badge>
    default:
      return <Badge variant="secondary">{result}</Badge>
  }
}

const getTypeBadge = (intervention: Intervention) => {
  if (intervention.remplacements && intervention.remplacements.length > 0)
    return <Badge variant="outline" className="border-warning/50 text-warning">Replacement</Badge>
  if (intervention.company_id)
    return <Badge variant="outline" className="border-primary/50 text-primary">External Service</Badge>
  if (intervention.repare_par_admin)
    return <Badge variant="outline">Admin Repair</Badge>
  return <Badge variant="outline">Internal Repair</Badge>
}

const getStatusBadge = (intervention: Intervention) => {
  if (intervention.resultat)
    return <Badge className="bg-success/10 text-success"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>
  if (intervention.date_retour_drr)
    return <Badge className="bg-chart-5/10 text-chart-5"><Package className="mr-1 h-3 w-3" />Returned</Badge>
  if (intervention.date_envoi_entreprise)
    return <Badge className="bg-primary/10 text-primary"><Truck className="mr-1 h-3 w-3" />Shipped</Badge>
  return <Badge className="bg-warning/10 text-warning"><Wrench className="mr-1 h-3 w-3" />In Progress</Badge>
}

const getTypeKey = (intervention: Intervention) => {
  if (intervention.remplacements && intervention.remplacements.length > 0) return "replacements"
  if (intervention.company_id) return "external"
  return "internal"
}

export default function InterventionsPage() {
  const { data: interventions, isLoading, error } = useInterventions()
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
        Failed to load interventions. Please try again.
      </div>
    )
  }

  const interventionList = interventions || []

  const filterList = (list: Intervention[]) =>
    list.filter((i) => {
      const materielName = i.probleme?.materiel
        ? `${i.probleme.materiel.marque} ${i.probleme.materiel.modele}`
        : ""
      const operatorName = i.operator?.name ?? ""
      const companyName = i.company?.name ?? ""
      const matchesSearch =
        String(i.id).includes(searchQuery) ||
        materielName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companyName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || (() => {
        if (statusFilter === "completed") return !!i.resultat
        if (statusFilter === "returned") return !!i.date_retour_drr && !i.resultat
        if (statusFilter === "shipped") return !!i.date_envoi_entreprise && !i.date_retour_drr
        if (statusFilter === "in_progress") return !i.date_envoi_entreprise && !i.resultat
        return true
      })()
      return matchesSearch && matchesStatus
    })

  const InterventionTable = ({ list }: { list: Intervention[] }) => (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Matériel / Problème</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Operator</TableHead>
            <TableHead className="hidden sm:table-cell">Company</TableHead>
            <TableHead className="hidden xl:table-cell">Result</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No interventions found
              </TableCell>
            </TableRow>
          ) : (
            list.map((intervention) => (
              <TableRow key={intervention.id}>
                <TableCell className="font-mono text-sm">#{intervention.id}</TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {intervention.probleme?.materiel
                      ? `${intervention.probleme.materiel.marque} ${intervention.probleme.materiel.modele}`
                      : `Materiel #${intervention.probleme?.materiel_id ?? "—"}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Problème #{intervention.probleme_id}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">{getTypeBadge(intervention)}</TableCell>
                <TableCell>{getStatusBadge(intervention)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {intervention.operator?.name ?? `#${intervention.operator_id}`}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {intervention.company ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{intervention.company.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {getResultBadge(intervention.resultat)}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Intervention #{intervention.id}</DialogTitle>
                        <DialogDescription>
                          Problème #{intervention.probleme_id}
                          {intervention.probleme?.materiel &&
                            ` — ${intervention.probleme.materiel.marque} ${intervention.probleme.materiel.modele}`}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Status</p>
                            {getStatusBadge(intervention)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Type</p>
                            {getTypeBadge(intervention)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Operator</p>
                            <p className="font-medium text-foreground">
                              {intervention.operator?.name ?? `#${intervention.operator_id}`}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Company</p>
                            <p className="font-medium text-foreground">
                              {intervention.company?.name ?? "—"}
                            </p>
                          </div>
                        </div>
                        {intervention.diagnostic && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Diagnostic</p>
                            <p className="text-foreground">{intervention.diagnostic}</p>
                          </div>
                        )}
                        {intervention.reference_envoi && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Shipment Reference</p>
                            <p className="font-mono text-foreground">{intervention.reference_envoi}</p>
                          </div>
                        )}
                        {intervention.reference_retour && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Return Reference</p>
                            <p className="font-mono text-foreground">{intervention.reference_retour}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date Envoi</p>
                            <p className="flex items-center gap-1 text-foreground text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {intervention.date_envoi_entreprise
                                ? new Date(intervention.date_envoi_entreprise).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date Retour</p>
                            <p className="flex items-center gap-1 text-foreground text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {intervention.date_retour_final
                                ? new Date(intervention.date_retour_final).toLocaleDateString()
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Result</p>
                          {getResultBadge(intervention.resultat)}
                        </div>

                        {/* Remplacements */}
                        {intervention.remplacements && intervention.remplacements.length > 0 && (
                          <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <ArrowRightLeft className="h-4 w-4" />
                              Replacement Details
                            </h4>
                            {intervention.remplacements.map((r) => (
                              <div key={r.id} className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Old Materiel</p>
                                  <p className="font-medium text-foreground">#{r.ancien_materiel_id}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">New Materiel</p>
                                  <p className="font-medium text-foreground">{r.nouveau_marque} {r.nouveau_modele}</p>
                                  <p className="font-mono text-xs text-muted-foreground">{r.nouveau_code_onee}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  const filtered = filterList(interventionList)

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
              placeholder="Search by materiel, operator, company..."
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
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-0">
          <InterventionTable list={filtered} />
        </TabsContent>

        <TabsContent value="internal" className="mt-0">
          <InterventionTable list={filterList(interventionList.filter((i) => getTypeKey(i) === "internal"))} />
        </TabsContent>

        <TabsContent value="external" className="mt-0">
          <InterventionTable list={filterList(interventionList.filter((i) => getTypeKey(i) === "external"))} />
        </TabsContent>

        <TabsContent value="replacements" className="mt-0">
          <InterventionTable list={filterList(interventionList.filter((i) => getTypeKey(i) === "replacements"))} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filtered.length} of {interventionList.length} interventions</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}