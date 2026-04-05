"use client"

import { useState } from "react"
import {
  Monitor, Laptop, Printer, Plus, Search, Filter,
  MoreHorizontal, Eye, Pencil, Trash2, UserPlus, Loader2, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAffectations, useMateriels, useUsers } from "@/lib/hooks/use-api"
import { materielsApi, affectationsApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { mutate } from "swr"
import type { Materiel } from "@/lib/api"

const getMaterielIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "laptop": return Laptop
    case "printer": return Printer
    default: return Monitor
  }
}

const emptyForm = {
  type: "", marque: "", modele: "", code_onee: "",
  numero_serie: "", numero_inventaire: "", date_arrive_drr: "",
}

export default function DevicesPage() {
  const { token } = useAuth()
  const { data: materiels, isLoading, error } = useMateriels()
  const { data: users } = useUsers()
  const { data: affectations } = useAffectations()

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  // Add dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [newMateriel, setNewMateriel] = useState({ ...emptyForm })

  // View dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedMateriel, setSelectedMateriel] = useState<Materiel | null>(null)

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ ...emptyForm })
  const [editError, setEditError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState("")
  const [assignEntite, setAssignEntite] = useState("")
  const [assignAgence, setAssignAgence] = useState("")
  const [assignSecteur, setAssignSecteur] = useState("")
  const [assignCentre, setAssignCentre] = useState("")
  const [assignError, setAssignError] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  // Delete error
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddMateriel = async () => {
    if (!token) return
    setSubmitError(null)
    if (!newMateriel.type || !newMateriel.marque || !newMateriel.modele ||
        !newMateriel.code_onee || !newMateriel.numero_serie ||
        !newMateriel.numero_inventaire || !newMateriel.date_arrive_drr) {
      setSubmitError("All fields are required.")
      return
    }
    setIsSubmitting(true)
    try {
      await materielsApi.create(newMateriel, token)
      mutate(["materiels", token])
      setAddDialogOpen(false)
      setNewMateriel({ ...emptyForm })
    } catch (err: any) {
      setSubmitError(err.message || "Failed to add materiel")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (m: Materiel) => {
    setSelectedMateriel(m)
    setEditForm({
      type: m.type, marque: m.marque, modele: m.modele,
      code_onee: m.code_onee, numero_serie: m.numero_serie,
      numero_inventaire: m.numero_inventaire,
      date_arrive_drr: m.date_arrive_drr
        ? new Date(m.date_arrive_drr).toISOString().split("T")[0]
        : "",
    })
    setEditError(null)
    setEditDialogOpen(true)
  }

  const handleEditMateriel = async () => {
    if (!token || !selectedMateriel) return
    setEditError(null)
    setIsEditing(true)
    try {
      await materielsApi.update(selectedMateriel.id, editForm, token)
      mutate(["materiels", token])
      setEditDialogOpen(false)
    } catch (err: any) {
      setEditError(err.message || "Failed to update materiel")
    } finally {
      setIsEditing(false)
    }
  }

  const openAssign = (m: Materiel) => {
    setSelectedMateriel(m)
    setAssignUserId("")
    setAssignEntite("")
    setAssignAgence("")
    setAssignSecteur("")
    setAssignCentre("")
    setAssignError(null)
    setAssignDialogOpen(true)
  }

  const handleAssignUser = async () => {
    if (!token || !selectedMateriel) return
    setAssignError(null)
    if (!assignUserId || !assignEntite || !assignAgence || !assignSecteur || !assignCentre) {
      setAssignError("All fields are required.")
      return
    }
    setIsAssigning(true)
    try {
      await affectationsApi.create({
        materiel_id: selectedMateriel.id,
        user_id: parseInt(assignUserId),
        entite: assignEntite,
        agence: assignAgence,
        secteur: assignSecteur,
        centre: assignCentre,
        date_debut: new Date().toISOString(),
      }, token)
      mutate(["materiels", token])
      mutate(["affectations", token])
      setAssignDialogOpen(false)
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign user")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteMateriel = async (id: number) => {
    if (!token) return
    setDeleteError(null)
    try {
      await materielsApi.delete(id, token)
      mutate(["materiels", token])
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete materiel")
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
        Failed to load materiels. Please try again.
      </div>
    )
  }

  const materielList = materiels || []
  const currentAffectations = (affectations || []).filter(
    (a: any) => a.date_fin === null || a.date_fin === undefined || a.date_fin === ""
  )
  const filteredMateriels = materielList.filter((m) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      m.marque?.toLowerCase().includes(q) || m.modele?.toLowerCase().includes(q) ||
      m.numero_serie?.toLowerCase().includes(q) ||
      m.numero_inventaire?.toLowerCase().includes(q) ||
      m.code_onee?.toLowerCase().includes(q)
    const matchesType = typeFilter === "all" || m.type?.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesType
  })
  const selectedMaterielAffectation = selectedMateriel
    ? currentAffectations
        .filter((a) => a.materiel_id === selectedMateriel.id)
        .sort(
          (a, b) =>
            new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime()
        )[0]
    : null
  const assignedUser = selectedMaterielAffectation?.user
    ?? (selectedMaterielAffectation
      ? (users || []).find((u) => u.id === selectedMaterielAffectation.user_id)
      : null)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Materiels</h1>
          <p className="text-muted-foreground">Manage all IT equipment in your organization</p>
        </div>
        <Button onClick={() => { setSubmitError(null); setNewMateriel({ ...emptyForm }); setAddDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />Add Materiel
        </Button>
      </div>

      {deleteError && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {deleteError}
          <button onClick={() => setDeleteError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by marque, modele, serial, code ONEE..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Type" />
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Marque / Modèle</TableHead>
              <TableHead className="hidden md:table-cell">Code ONEE</TableHead>
              <TableHead className="hidden md:table-cell">N° Inventaire</TableHead>
              <TableHead className="hidden lg:table-cell">N° Série</TableHead>
              <TableHead className="hidden lg:table-cell">Date Arrivée</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMateriels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No materiels found
                </TableCell>
              </TableRow>
            ) : (
              filteredMateriels.map((m) => {
                const MaterielIcon = getMaterielIcon(m.type)
                const isAssigned = currentAffectations.some((a: any) => {
                  const affectationMaterielId = a.materiel_id ?? a.materiel?.id
                  return Number(affectationMaterielId) === Number(m.id)
                })
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <MaterielIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="hidden sm:inline">{m.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{m.marque}</p>
                      <p className="text-sm text-muted-foreground">{m.modele}</p>
                    </TableCell>
                    <TableCell className="hidden font-mono text-sm md:table-cell">{m.code_onee}</TableCell>
                    <TableCell className="hidden font-mono text-sm md:table-cell">{m.numero_inventaire}</TableCell>
                    <TableCell className="hidden font-mono text-sm lg:table-cell">{m.numero_serie}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {new Date(m.date_arrive_drr).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedMateriel(m); setViewDialogOpen(true) }}>
                            <Eye className="mr-2 h-4 w-4" />View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(m)}>
                            <Pencil className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => !isAssigned && openAssign(m)}
                            disabled={isAssigned}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {isAssigned ? "Already Assigned" : "Assign User"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteMateriel(m.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredMateriels.length} of {materielList.length} materiels
      </p>

      {/* ── ADD DIALOG ─────────────────────────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open)
        if (!open) { setSubmitError(null); setNewMateriel({ ...emptyForm }) }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Materiel</DialogTitle>
            <DialogDescription>Enter the details of the new materiel.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {submitError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newMateriel.type} onValueChange={(v) => setNewMateriel({ ...newMateriel, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Printer">Printer</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marque</Label>
                <Input placeholder="e.g., Dell, HP" value={newMateriel.marque}
                  onChange={(e) => setNewMateriel({ ...newMateriel, marque: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Modele</Label>
              <Input placeholder="e.g., OptiPlex 7090" value={newMateriel.modele}
                onChange={(e) => setNewMateriel({ ...newMateriel, modele: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code ONEE</Label>
                <Input placeholder="Unique code" value={newMateriel.code_onee}
                  onChange={(e) => setNewMateriel({ ...newMateriel, code_onee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Numéro Série</Label>
                <Input placeholder="Serial number" value={newMateriel.numero_serie}
                  onChange={(e) => setNewMateriel({ ...newMateriel, numero_serie: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numéro Inventaire</Label>
                <Input placeholder="Inventory number" value={newMateriel.numero_inventaire}
                  onChange={(e) => setNewMateriel({ ...newMateriel, numero_inventaire: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date Arrivée DRR</Label>
                <Input type="date" value={newMateriel.date_arrive_drr}
                  onChange={(e) => setNewMateriel({ ...newMateriel, date_arrive_drr: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddMateriel} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Materiel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIEW DIALOG ────────────────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Materiel Details</DialogTitle>
          </DialogHeader>
          {selectedMateriel && (
            <div className="space-y-4 py-2">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Type", selectedMateriel.type],
                  ["Marque", selectedMateriel.marque],
                  ["Modele", selectedMateriel.modele],
                  ["Code ONEE", selectedMateriel.code_onee],
                  ["N° Serie", selectedMateriel.numero_serie],
                  ["N° Inventaire", selectedMateriel.numero_inventaire],
                  ["Date Arrivee", new Date(selectedMateriel.date_arrive_drr).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium text-foreground font-mono">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Current Assignment</p>
                  <Badge variant={selectedMaterielAffectation ? "default" : "secondary"}>
                    {selectedMaterielAffectation ? "Assigned" : "Unassigned"}
                  </Badge>
                </div>

                {selectedMaterielAffectation ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">User</dt>
                      <dd className="font-medium text-foreground">
                        {assignedUser?.name ?? `User #${selectedMaterielAffectation.user_id}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium text-foreground">
                        {assignedUser?.email ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="font-medium text-foreground">
                        {assignedUser?.role ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Entite</dt>
                      <dd className="font-medium text-foreground">{selectedMaterielAffectation.entite}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Agence</dt>
                      <dd className="font-medium text-foreground">{selectedMaterielAffectation.agence}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Secteur</dt>
                      <dd className="font-medium text-foreground">{selectedMaterielAffectation.secteur}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Centre</dt>
                      <dd className="font-medium text-foreground">{selectedMaterielAffectation.centre}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Date </dt>
                      <dd className="font-medium text-foreground">
                        {new Date(selectedMaterielAffectation.date_debut).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This materiel is not currently assigned to any user.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ────────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditError(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Materiel</DialogTitle>
            <DialogDescription>Update the details of this materiel.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{editError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Printer">Printer</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marque</Label>
                <Input value={editForm.marque} onChange={(e) => setEditForm({ ...editForm, marque: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Modele</Label>
              <Input value={editForm.modele} onChange={(e) => setEditForm({ ...editForm, modele: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code ONEE</Label>
                <Input value={editForm.code_onee} onChange={(e) => setEditForm({ ...editForm, code_onee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Numéro Série</Label>
                <Input value={editForm.numero_serie} onChange={(e) => setEditForm({ ...editForm, numero_serie: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numéro Inventaire</Label>
                <Input value={editForm.numero_inventaire} onChange={(e) => setEditForm({ ...editForm, numero_inventaire: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date Arrivée DRR</Label>
                <Input type="date" value={editForm.date_arrive_drr} onChange={(e) => setEditForm({ ...editForm, date_arrive_drr: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isEditing}>Cancel</Button>
            <Button onClick={handleEditMateriel} disabled={isEditing}>
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ASSIGN USER DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={assignDialogOpen} onOpenChange={(open) => { setAssignDialogOpen(open); if (!open) setAssignError(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>
              Assign {selectedMateriel?.marque} {selectedMateriel?.modele} to a user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {assignError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{assignError}</div>}
            <div className="space-y-2">
              <Label>User <span className="text-destructive">*</span></Label>
              <Select value={assignUserId} onValueChange={setAssignUserId}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {(users || []).map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name} — {u.email} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entité</Label>
                <Input placeholder="e.g., DRR" value={assignEntite} onChange={(e) => setAssignEntite(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Agence</Label>
                <Input placeholder="e.g., Casablanca" value={assignAgence} onChange={(e) => setAssignAgence(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secteur</Label>
                <Input placeholder="Secteur" value={assignSecteur} onChange={(e) => setAssignSecteur(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Centre</Label>
                <Input placeholder="Centre" value={assignCentre} onChange={(e) => setAssignCentre(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={isAssigning}>Cancel</Button>
            <Button onClick={handleAssignUser} disabled={isAssigning}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}