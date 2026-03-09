"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Monitor, AlertCircle, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const devices = [
  {
    id: "DEV-001",
    name: "Dell OptiPlex 7090",
    type: "PC",
    inventoryNumber: "INV-2024-001",
    serialNumber: "D3LL7090X1234",
  },
  {
    id: "DEV-002",
    name: "HP EliteBook 840 G8",
    type: "Laptop",
    inventoryNumber: "INV-2024-015",
    serialNumber: "HP840G8Y5678",
  },
  {
    id: "DEV-004",
    name: "LG 27UK850-W 4K",
    type: "Monitor",
    inventoryNumber: "INV-2024-032",
    serialNumber: "LG27UK3456",
  },
  {
    id: "DEV-008",
    name: "Canon PIXMA TR8620",
    type: "Printer",
    inventoryNumber: "INV-2024-056",
    serialNumber: "CANTR8620Z9012",
  },
]

export default function ReportProblemPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ReportProblemForm />
    </Suspense>
  )
}

function ReportProblemForm() {
  const searchParams = useSearchParams()
  const preselectedDevice = searchParams.get("device")
  
  const [selectedDevice, setSelectedDevice] = useState(preselectedDevice || "")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedDeviceInfo = devices.find((d) => d.id === selectedDevice)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    // Would redirect to problems list
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/problems">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Report Problem</h1>
          <p className="text-muted-foreground">Submit a new IT equipment issue</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Before reporting</AlertTitle>
        <AlertDescription>
          Please ensure you have tried basic troubleshooting steps such as restarting the device.
          Provide as much detail as possible to help our IT team diagnose the issue quickly.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground">Device Selection</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the device you are experiencing issues with
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device">Select Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger id="device">
                  <SelectValue placeholder="Choose a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span>{device.name}</span>
                        <span className="text-muted-foreground">({device.type})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDeviceInfo && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Monitor className="h-4 w-4" />
                  Device Information
                </h4>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium text-foreground">{selectedDeviceInfo.type}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium text-foreground">{selectedDeviceInfo.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Inventory #</dt>
                    <dd className="font-mono text-foreground">{selectedDeviceInfo.inventoryNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Serial #</dt>
                    <dd className="font-mono text-foreground">{selectedDeviceInfo.serialNumber}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground">Problem Details</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the issue you are experiencing in detail
          </p>

          <div className="mt-4 space-y-2">
            <Label htmlFor="description">Problem Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the problem in detail. Include when it started, how often it occurs, and any error messages you've seen..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters. The more detail you provide, the faster we can help.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/problems" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1"
            disabled={!selectedDevice || description.length < 20 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Submit Problem
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
