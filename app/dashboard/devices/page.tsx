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

const devices = [
  {
    id: "DEV-001",
    type: "PC",
    brand: "Dell",
    model: "OptiPlex 7090",
    inventoryNumber: "INV-2024-001",
    serialNumber: "D3LL7090X1234",
    status: "Active",
    assignedUser: "John Doe",
  },
  {
    id: "DEV-002",
    type: "Laptop",
    brand: "HP",
    model: "EliteBook 840",
    inventoryNumber: "INV-2024-002",
    serialNumber: "HP840G8Y5678",
    status: "Active",
    assignedUser: "Jane Smith",
  },
  {
    id: "DEV-003",
    type: "Printer",
    brand: "Canon",
    model: "imageRUNNER C3226i",
    inventoryNumber: "INV-2024-003",
    serialNumber: "CAN3226Z9012",
    status: "Under Repair",
    assignedUser: "IT Department",
  },
  {
    id: "DEV-004",
    type: "Monitor",
    brand: "LG",
    model: "27UK850-W",
    inventoryNumber: "INV-2024-004",
    serialNumber: "LG27UK3456",
    status: "Active",
    assignedUser: "Mike Johnson",
  },
  {
    id: "DEV-005",
    type: "PC",
    brand: "Lenovo",
    model: "ThinkCentre M920",
    inventoryNumber: "INV-2024-005",
    serialNumber: "LEN920Q7890",
    status: "Inactive",
    assignedUser: "Unassigned",
  },
  {
    id: "DEV-006",
    type: "Laptop",
    brand: "Apple",
    model: "MacBook Pro 14",
    inventoryNumber: "INV-2024-006",
    serialNumber: "APPMB14X1234",
    status: "Active",
    assignedUser: "Sarah Wilson",
  },
  {
    id: "DEV-007",
    type: "Printer",
    brand: "HP",
    model: "LaserJet Pro M404",
    inventoryNumber: "INV-2024-007",
    serialNumber: "HPM404Y5678",
    status: "Shipped",
    assignedUser: "Finance Dept",
  },
]

const getDeviceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "laptop":
      return Laptop
    case "printer":
      return Printer
    default:
      return Monitor
  }
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <Badge className="bg-success/10 text-success hover:bg-success/20">{status}</Badge>
    case "under repair":
      return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">{status}</Badge>
    case "shipped":
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{status}</Badge>
    case "inactive":
      return <Badge variant="secondary">{status}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DevicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.inventoryNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || device.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || device.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Devices</h1>
          <p className="text-muted-foreground">Manage all IT equipment in your organization</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>
                Enter the details of the new device to add to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Device Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pc">PC</SelectItem>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="printer">Printer</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" placeholder="e.g., Dell, HP" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="e.g., OptiPlex 7090" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory Number</Label>
                  <Input id="inventory" placeholder="INV-2024-XXX" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serial">Serial Number</Label>
                  <Input id="serial" placeholder="Device serial number" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setAddDialogOpen(false)}>Add Device</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by brand, model, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under repair">Under Repair</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Brand / Model</TableHead>
              <TableHead className="hidden md:table-cell">Inventory #</TableHead>
              <TableHead className="hidden lg:table-cell">Serial #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.type)
              return (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="hidden sm:inline">{device.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{device.brand}</p>
                      <p className="text-sm text-muted-foreground">{device.model}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-sm">
                    {device.inventoryNumber}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell font-mono text-sm">
                    {device.serialNumber}
                  </TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {device.assignedUser}
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
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredDevices.length} of {devices.length} devices</p>
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
