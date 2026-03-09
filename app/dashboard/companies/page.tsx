"use client"

import { useState } from "react"
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Wrench,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const companies = [
  {
    id: 1,
    name: "Canon Service Center",
    type: "Printer Service",
    email: "support@canon-service.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, San Francisco, CA",
    website: "www.canon-service.com",
    activeDevices: 3,
    status: "Active",
  },
  {
    id: 2,
    name: "HP Support",
    type: "Computer Service",
    email: "enterprise@hp-support.com",
    phone: "+1 (555) 234-5678",
    address: "456 Innovation Ave, Palo Alto, CA",
    website: "www.hp.com/support",
    activeDevices: 5,
    status: "Active",
  },
  {
    id: 3,
    name: "Apple Authorized Service",
    type: "Apple Devices",
    email: "business@apple-auth.com",
    phone: "+1 (555) 345-6789",
    address: "789 Cupertino Blvd, Cupertino, CA",
    website: "www.apple.com/support",
    activeDevices: 2,
    status: "Active",
  },
  {
    id: 4,
    name: "Dell Enterprise Support",
    type: "Computer Service",
    email: "enterprise@dell-support.com",
    phone: "+1 (555) 456-7890",
    address: "321 Round Rock Way, Austin, TX",
    website: "www.dell.com/support",
    activeDevices: 0,
    status: "Inactive",
  },
  {
    id: 5,
    name: "LG Electronics Service",
    type: "Display Service",
    email: "business@lg-service.com",
    phone: "+1 (555) 567-8901",
    address: "654 Display Drive, Seoul Tech Park",
    website: "www.lg.com/support",
    activeDevices: 1,
    status: "Active",
  },
]

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Companies</h1>
          <p className="text-muted-foreground">Manage external service providers and partners</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Add a new service provider or partner company.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Company Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input id="serviceType" placeholder="Computer Service" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input id="companyEmail" type="email" placeholder="support@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input id="companyPhone" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input id="companyWebsite" placeholder="www.company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea id="companyAddress" placeholder="Full company address" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setAddDialogOpen(false)}>Add Company</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{companies.length}</p>
              <p className="text-sm text-muted-foreground">Total Companies</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Building2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {companies.filter((c) => c.status === "Active").length}
              </p>
              <p className="text-sm text-muted-foreground">Active Partners</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Wrench className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {companies.reduce((acc, c) => acc + c.activeDevices, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Devices in Service</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{company.name}</p>
                      <p className="text-sm text-muted-foreground">{company.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {company.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {company.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-start gap-1 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="max-w-[200px] truncate">{company.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={company.activeDevices > 0 ? "default" : "secondary"}>
                    {company.activeDevices} active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      company.status === "Active"
                        ? "border-success/50 text-success"
                        : "border-muted-foreground/50 text-muted-foreground"
                    }
                  >
                    {company.status}
                  </Badge>
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
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
