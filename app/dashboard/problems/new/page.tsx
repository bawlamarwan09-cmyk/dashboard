"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { useMateriels } from "@/lib/hooks/use-api"
import { problemesApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { mutate } from "swr"

export default function NewProblemePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewProblemeForm />
    </Suspense>
  )
}

function NewProblemeForm() {
  const router = useRouter()
  const { token } = useAuth()
  const { data: materiels, isLoading: loadingMateriels } = useMateriels()

  const [selectedMaterielId, setSelectedMaterielId] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMateriel = materiels?.find((m) => String(m.id) === selectedMaterielId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !selectedMaterielId || description.length < 20) return

    setIsSubmitting(true)
    setError(null)
    try {
      await problemesApi.create(
        { materiel_id: parseInt(selectedMaterielId), description },
        token
      )
      mutate(["problems", token])
      router.push("/dashboard/problems")
    } catch (err: any) {
      setError(err.message || "Failed to submit problème")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/problemes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Report Problème</h1>
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

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground">Matériel Selection</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the matériel you are experiencing issues with
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="materiel">Select Matériel</Label>
              {loadingMateriels ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading materiels...
                </div>
              ) : (
                <Select value={selectedMaterielId} onValueChange={setSelectedMaterielId}>
                  <SelectTrigger id="materiel">
                    <SelectValue placeholder="Choose a matériel" />
                  </SelectTrigger>
                  <SelectContent>
                    {(materiels || []).map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-muted-foreground" />
                          <span>{m.marque} {m.modele}</span>
                          <span className="text-muted-foreground">({m.type})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedMateriel && (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Monitor className="h-4 w-4" />
                  Matériel Information
                </h4>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium text-foreground">{selectedMateriel.type}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Marque / Modèle</dt>
                    <dd className="font-medium text-foreground">{selectedMateriel.marque} {selectedMateriel.modele}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">N° Inventaire</dt>
                    <dd className="font-mono text-foreground">{selectedMateriel.numero_inventaire}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">N° Série</dt>
                    <dd className="font-mono text-foreground">{selectedMateriel.numero_serie}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Code ONEE</dt>
                    <dd className="font-mono text-foreground">{selectedMateriel.code_onee}</dd>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the problem in detail. Include when it started, how often it occurs, and any error messages you've seen..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/20 minimum characters.{" "}
              {description.length < 20 && (
                <span className="text-destructive">{20 - description.length} more needed.</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/problems" className="flex-1">
            <Button variant="outline" className="w-full" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1"
            disabled={!selectedMaterielId || description.length < 20 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Submit Problème
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}