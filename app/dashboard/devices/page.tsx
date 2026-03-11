"use client"

import { useState } from "react"
import {
  Monitor,
  Laptop,
  Printer,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useMateriels } from "@/lib/hooks/use-api"
import { materielsApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { mutate } from "swr"

const getMaterielIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "laptop":
      return Laptop
    case "printer":
      return Printer
    default:
      return Monitor
  }
}

export default function DevicesPage() {
  const { token } = useAuth()
  const { data: materiels, isLoading, error } = useMateriels()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newMateriel, setNewMateriel] = useState({
    type: "",
    marque: "",
    modele: "",
    code_onee: "",
    numero_serie: "",
    numero_inventaire: "",
    date_arrive_drr: "",
  })

  const handleAddMateriel = async () => {
    if (!token) return
    setIsSubmitting(true)
    try {
      await materielsApi.create(newMateriel, token)
      mutate(["materiels", token])
      setAddDialogOpen(false)
      setNewMateriel({
        type: "",
        marque: "",
        modele: "",
        code_onee: "",
        numero_serie: "",
        numero_inventaire: "",
        date_arrive_drr: "",
      })
    } catch (err) {
      console.error("Failed to add materiel:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMateriel = async (id: number) => {
    if (!token) return
    try {
      await materielsApi.delete(id, token)
      mutate(["materiels", token])
    } catch (err) {
      console.error("Failed to delete materiel:", err)
    }
  }

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

  const filteredMateriels = materielList.filter((m) => {
    const matchesSearch =
      m.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.modele?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.numero_serie?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.numero_inventaire?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code_onee?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      typeFilter === "all" || m.type?.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Materiels</h1>
          <p className="text-muted-foreground">Manage all IT equipment in your organization</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Materiel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Materiel</DialogTitle>
              <DialogDescription>
                Enter the details of the new materiel to add to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newMateriel.type}
                    onValueChange={(v) => setNewMateriel({ ...newMateriel, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
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
                  <Input
                    placeholder="e.g., Dell, HP"
                    value={newMateriel.marque}
                    onChange={(e) => setNewMateriel({ ...newMateriel, marque: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Modele</Label>
                <Input
                  placeholder="e.g., OptiPlex 7090"
                  value={newMateriel.modele}
                  onChange={(e) => setNewMateriel({ ...newMateriel, modele: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code ONEE</Label>
                  <Input
                    placeholder="Code ONEE unique"
                    value={newMateriel.code_onee}
                    onChange={(e) => setNewMateriel({ ...newMateriel, code_onee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro Série</Label>
                  <Input
                    placeholder="Serial number"
                    value={newMateriel.numero_serie}
                    onChange={(e) => setNewMateriel({ ...newMateriel, numero_serie: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numéro Inventaire</Label>
                  <Input
                    placeholder="Inventory number"
                    value={newMateriel.numero_inventaire}
                    onChange={(e) => setNewMateriel({ ...newMateriel, numero_inventaire: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Arrivée DRR</Label>
                  <Input
                    type="date"
                    value={newMateriel.date_arrive_drr}
                    onChange={(e) => setNewMateriel({ ...newMateriel, date_arrive_drr: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
             <Button 
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("clicked", { token, newMateriel })
    handleAddMateriel()
  }} 
  disabled={isSubmitting}
>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Materiel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by marque, modele, serial, code ONEE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Type" />
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
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No materiels found
                </TableCell>
              </TableRow>
            ) : (
              filteredMateriels.map((m) => {
                const MaterielIcon = getMaterielIcon(m.type)
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
                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {m.code_onee}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">
                      {m.numero_inventaire}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-sm">
                      {m.numero_serie}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteMateriel(m.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredMateriels.length} of {materielList.length} materiels</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}