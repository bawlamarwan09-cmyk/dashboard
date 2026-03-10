"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  UserX,
  KeyRound,
  Mail,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"

type BackendRole = "USER" | "OPERATOR" | "COMPANY" | "ADMIN"
type UserStatus = "ACTIVE" | "INACTIVE"

type AppUser = {
  id: number | string
  name: string
  email: string
  role: BackendRole
  company?: string
  status: UserStatus
  created_at?: string
}

const mockUsers: AppUser[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    role: "USER",
    company: "Engineering",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "USER",
    company: "Marketing",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Mike Tech",
    email: "mike.tech@company.com",
    role: "OPERATOR",
    company: "IT Support",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Sarah Admin",
    email: "sarah.admin@company.com",
    role: "ADMIN",
    company: "IT Management",
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "Emma Wilson",
    email: "emma.wilson@company.com",
    role: "USER",
    company: "Finance",
    status: "INACTIVE",
  },
  {
    id: 6,
    name: "Robert Chen",
    email: "robert.chen@company.com",
    role: "OPERATOR",
    company: "IT Support",
    status: "ACTIVE",
  },
]

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const getRoleBadge = (role: BackendRole) => {
  switch (role) {
    case "ADMIN":
      return (
        <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      )

    case "OPERATOR":
      return (
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
          <Shield className="mr-1 h-3 w-3" />
          Operator
        </Badge>
      )

    case "COMPANY":
      return (
        <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
          <Building2 className="mr-1 h-3 w-3" />
          Company
        </Badge>
      )

    default:
      return (
        <Badge variant="secondary">
          <UserIcon className="mr-1 h-3 w-3" />
          User
        </Badge>
      )
  }
}

const getStatusBadge = (status: UserStatus) => {
  const isActive = status === "ACTIVE"

  return (
    <Badge
      variant="outline"
      className={cn(
        isActive
          ? "border-green-500/50 text-green-600"
          : "border-muted-foreground/50 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "mr-1 h-2 w-2 rounded-full",
          isActive ? "bg-green-500" : "bg-muted-foreground"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

export default function UsersPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | BackendRole>("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "USER" as BackendRole,
    company: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)

      const matchesRole = roleFilter === "all" || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [searchQuery, roleFilter])

  if (!mounted) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and assign their role.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: BackendRole) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="OPERATOR">Operator</SelectItem>
                      <SelectItem value="COMPANY">Company</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company / Department</Label>
                  <Input
                    id="company"
                    placeholder="Engineering"
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setAddDialogOpen(false)}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{mockUsers.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <UserIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {mockUsers.filter((u) => u.status === "ACTIVE").length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {mockUsers.filter((u) => u.role === "OPERATOR").length}
              </p>
              <p className="text-sm text-muted-foreground">Operators</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <ShieldCheck className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {mockUsers.filter((u) => u.role === "ADMIN").length}
              </p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onValueChange={(value: "all" | BackendRole) => setRoleFilter(value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="OPERATOR">Operator</SelectItem>
            <SelectItem value="COMPANY">Company</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Company / Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredUsers.map((user) => (
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

                <TableCell className="hidden md:table-cell">
                  {getRoleBadge(user.role)}
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {user.company || "-"}
                  </div>
                </TableCell>

                <TableCell>{getStatusBadge(user.status)}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}