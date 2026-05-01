"use client"

import { useState } from "react"
import {
  Users, Search, Plus, MoreHorizontal, Pencil,
  Trash2, KeyRound, Shield, ShieldCheck,
  User as UserIcon, Building2, Loader2, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useUsers } from "@/lib/hooks/use-api"
import { usersApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { mutate } from "swr"
import type { Role, User } from "@/lib/api"

const getInitials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()

const getRoleBadge = (role: Role) => {
  switch (role) {
    case "ADMIN":
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20"><ShieldCheck className="mr-1 h-3 w-3" />Admin</Badge>
    case "OPERATOR":
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20"><Shield className="mr-1 h-3 w-3" />Operator</Badge>
    case "COMPANY":
      return <Badge className="bg-warning/10 text-warning hover:bg-warning/20"><Building2 className="mr-1 h-3 w-3" />Company</Badge>
    default:
      return <Badge variant="secondary"><UserIcon className="mr-1 h-3 w-3" />User</Badge>
  }
}

export default function UsersPage() {
  const { token } = useAuth()
  const { data: users, isLoading, error } = useUsers()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all")

  // Add dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER" as Role })

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "USER" as Role })
  const [editError, setEditError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Reset password dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Delete error
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddUser = async () => {
    if (!token) return
    setSubmitError(null)
    if (!newUser.name || !newUser.email || !newUser.password) {
      setSubmitError("Name, email, and password are required.")
      return
    }
    setIsSubmitting(true)
    try {
      await usersApi.create(newUser as any, token)
      mutate(["users", token])
      setAddDialogOpen(false)
      setNewUser({ name: "", email: "", password: "", role: "USER" })
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create user")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role as Role })
    setEditError(null)
    setEditDialogOpen(true)
  }

  const handleEditUser = async () => {
    if (!token || !selectedUser) return
    setEditError(null)
    setIsEditing(true)
    try {
      await usersApi.update(selectedUser.id, editForm, token)
      mutate(["users", token])
      setEditDialogOpen(false)
    } catch (err: any) {
      setEditError(err.message || "Failed to update user")
    } finally {
      setIsEditing(false)
    }
  }

  const openResetPassword = (user: User) => {
    setSelectedUser(user)
    setNewPassword("")
    setResetError(null)
    setResetDialogOpen(true)
  }

  const handleResetPassword = async () => {
    if (!token || !selectedUser) return
    setResetError(null)
    if (!newPassword || newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.")
      return
    }
    setIsResetting(true)
    try {
      await usersApi.update(selectedUser.id, { password: newPassword } as any, token)
      setResetDialogOpen(false)
      setNewPassword("")
    } catch (err: any) {
      setResetError(err.message || "Failed to reset password")
    } finally {
      setIsResetting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!token) return
    setDeleteError(null)
    if (user.role === "ADMIN") {
      setDeleteError(`Cannot delete "${user.name}" — admin accounts are protected.`)
      return
    }
    try {
      await usersApi.delete(user.id, token)
      mutate(["users", token])
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete user")
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
        Failed to load users. Please try again.
      </div>
    )
  }

  const userList = users || []
  const filteredUsers = userList.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => { setSubmitError(null); setAddDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />Add User
        </Button>
      </div>

      {deleteError && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {deleteError}
          <button onClick={() => setDeleteError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", count: userList.length, icon: Users, color: "bg-primary/10", iconColor: "text-primary" },
          { label: "Users", count: userList.filter(u => u.role === "USER").length, icon: UserIcon, color: "bg-success/10", iconColor: "text-success" },
          { label: "Operators", count: userList.filter(u => u.role === "OPERATOR").length, icon: Shield, color: "bg-warning/10", iconColor: "text-warning" },
          { label: "Admins", count: userList.filter(u => u.role === "ADMIN").length, icon: ShieldCheck, color: "bg-destructive/10", iconColor: "text-destructive" },
        ].map(({ label, count, icon: Icon, color, iconColor }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{count}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as "all" | Role)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="OPERATOR">Operator</SelectItem>
            <SelectItem value="COMPANY">Company</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{getRoleBadge(user.role as Role)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" />Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetPassword(user)}>
                          <KeyRound className="mr-2 h-4 w-4" />Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={user.role === "ADMIN" ? "text-muted-foreground cursor-not-allowed opacity-50" : "text-destructive"}
                          disabled={user.role === "ADMIN"}
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {user.role === "ADMIN" ? "Delete (protected)" : "Delete"}
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

      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {userList.length} users
      </p>

      {/* ── ADD DIALOG ─────────────────────────────────────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open)
        if (!open) { setSubmitError(null); setNewUser({ name: "", email: "", password: "", role: "USER" }) }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account and assign their role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {submitError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john.doe@company.com" value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ────────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditError(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update the details for {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{editError}</div>}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isEditing}>Cancel</Button>
            <Button onClick={handleEditUser} disabled={isEditing}>
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RESET PASSWORD DIALOG ──────────────────────────────────────────── */}
      <Dialog open={resetDialogOpen} onOpenChange={(open) => { setResetDialogOpen(open); if (!open) setResetError(null) }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new password for {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {resetError && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{resetError}</div>}
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Min. 6 characters" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)} disabled={isResetting}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isResetting}>
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}