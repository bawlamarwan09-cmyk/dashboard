"use client"

import useSWR, { mutate } from "swr"
import { useAuth } from "../auth-context"
import {
  materielsApi,
  problemesApi,
  interventionsApi,
  messagesApi,
  affectationsApi,
  replacementsApi,
  historiqueApi,
  usersApi,
  dashboardApi,
  settingsApi,
} from "@/lib/api"

import type {
  Materiel,
  Probleme,
  Intervention,
  Remplacement,
  Affectation,
  Message,
  Historique,
  User,
  DashboardStats,
  ChartData,
  Settings,
  ProblemeStatus,
  InterventionResult,
} from "@/lib/api"

// ─── Dashboard (computed from real data) ─────────────────────────────────────

export function useDashboardStats() {
  const { token } = useAuth()

  const { data: problemes, isLoading: loadingP, error: errorP } = useSWR<Probleme[]>(
    token ? ["problemes", token] : null,
    () => problemesApi.getAll(token!)
  )
  const { data: materiels, isLoading: loadingM, error: errorM } = useSWR<Materiel[]>(
    token ? ["materiels", token] : null,
    () => materielsApi.getAll(token!)
  )
  const { data: interventions, isLoading: loadingI, error: errorI } = useSWR<Intervention[]>(
    token ? ["interventions", token] : null,
    () => interventionsApi.getAll(token!)
  )

  const isLoading = loadingP || loadingM || loadingI
  const error = errorP || errorM || errorI

  let data: DashboardStats | undefined = undefined

  if (problemes && materiels && interventions) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Active = any status except CLOSED
    const activeProblemes = problemes.filter((p) => p.status !== "CLOSED").length

    // Pending interventions = no result yet
    const pendingInterventions = interventions.filter((i) => !i.resultat).length

    // Resolved this month = CLOSED problems updated this month
    const resolvedThisMonth = problemes.filter(
      (p) => p.status === "CLOSED" && new Date(p.updated_at) >= startOfMonth
    ).length

    // Group problems by status
    const statusCounts = problemes.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {})
    const problemesByStatus = (Object.entries(statusCounts) as [ProblemeStatus, number][]).map(
      ([status, count]) => ({ status, count })
    )

    // Group materiels by type
    const typeCounts = materiels.reduce<Record<string, number>>((acc, m) => {
      acc[m.type] = (acc[m.type] ?? 0) + 1
      return acc
    }, {})
    const materielsByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }))

    data = {
      totalMateriels: materiels.length,
      activeProblemes,
      pendingInterventions,
      resolvedThisMonth,
      problemesByStatus,
      materielsByType,
    }
  }

  return { data, isLoading, error }
}

export function useDashboardCharts() {
  const { token } = useAuth()

  const { data: problemes, error: errorP } = useSWR<Probleme[]>(
    token ? ["problemes", token] : null,
    () => problemesApi.getAll(token!)
  )
  const { data: interventions, error: errorI } = useSWR<Intervention[]>(
    token ? ["interventions", token] : null,
    () => interventionsApi.getAll(token!)
  )
  const { data: materiels, error: errorM } = useSWR<Materiel[]>(
    token ? ["materiels", token] : null,
    () => materielsApi.getAll(token!)
  )

  const error = errorP || errorI || errorM

  let data: ChartData | undefined = undefined

  if (problemes && interventions && materiels) {
    // Problems by month — last 6 months
    const monthMap: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString("en", { month: "short", year: "2-digit" })
      monthMap[key] = 0
    }
    problemes.forEach((p) => {
      const d = new Date(p.created_at)
      const key = d.toLocaleString("en", { month: "short", year: "2-digit" })
      if (key in monthMap) monthMap[key]++
    })
    const problemesByMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count }))

    // Interventions by result
    const resultCounts = interventions.reduce<Record<string, number>>((acc, i) => {
      if (i.resultat) acc[i.resultat] = (acc[i.resultat] ?? 0) + 1
      return acc
    }, {})
    const interventionsByResult = (
      Object.entries(resultCounts) as [InterventionResult, number][]
    ).map(([result, count]) => ({ result, count }))

    // Materiels by type (reused from stats)
    const typeCounts = materiels.reduce<Record<string, number>>((acc, m) => {
      acc[m.type] = (acc[m.type] ?? 0) + 1
      return acc
    }, {})
    const materielsByType = Object.entries(typeCounts).map(([type, count]) => ({ type, count }))

    data = { problemesByMonth, interventionsByResult, materielsByType }
  }

  return { data, error }
}

// ─── Materiels ────────────────────────────────────────────────────────────────

export function useMateriels() {
  const { token } = useAuth()
  return useSWR<Materiel[]>(
    token ? ["materiels", token] : null,
    () => materielsApi.getAll(token!)
  )
}

export function useMateriel(id?: number) {
  const { token } = useAuth()
  return useSWR<Materiel>(
    token && id ? ["materiel", id, token] : null,
    () => materielsApi.getById(id!, token!)
  )
}

// ─── Affectations ─────────────────────────────────────────────────────────────

export function useAffectations() {
  const { token } = useAuth()
  return useSWR<Affectation[]>(
    token ? ["affectations", token] : null,
    () => affectationsApi.getAll(token!)
  )
}

export function useAffectationsByMateriel(materielId?: number) {
  const { token } = useAuth()
  return useSWR<Affectation[]>(
    token && materielId ? ["affectations-materiel", materielId, token] : null,
    () => affectationsApi.getByMateriel(materielId!, token!)
  )
}

export function useAffectationsByUser(userId?: number) {
  const { token } = useAuth()

  console.log("🔍 useAffectationsByUser called")
  console.log("userId:", userId)
  console.log("token:", token)

  return useSWR<Affectation[]>(
    token && userId ? ["affectations-user", userId, token] : null,
    async () => {
      console.log("🚀 Fetching affectations for user:", userId)

      try {
        const data = await affectationsApi.getByUser(userId!, token!)
        console.log("✅ Data received:", data)
        return data
      } catch (error) {
        console.error("❌ Error fetching affectations:", error)
        throw error
      }
    }
  )
}

// ─── Problemes ────────────────────────────────────────────────────────────────

export function useProblemes() {
  const { token } = useAuth()
  return useSWR<Probleme[]>(
    token ? ["problemes", token] : null,
    () => problemesApi.getAll(token!)
  )
}

export function useProbleme(id?: number) {
  const { token } = useAuth()
  return useSWR<Probleme>(
    token && id ? ["probleme", id, token] : null,
    () => problemesApi.getById(id!, token!)
  )
}

// ─── Interventions ────────────────────────────────────────────────────────────

export function useInterventions() {
  const { token } = useAuth()
  return useSWR<Intervention[]>(
    token ? ["interventions", token] : null,
    () => interventionsApi.getAll(token!)
  )
}

export function useIntervention(id?: number) {
  const { token } = useAuth()
  return useSWR<Intervention>(
    token && id ? ["intervention", id, token] : null,
    () => interventionsApi.getById(id!, token!)
  )
}

// ─── Remplacements ────────────────────────────────────────────────────────────

export function useRemplacements() {
  const { token } = useAuth()
  return useSWR<Remplacement[]>(
    token ? ["remplacements", token] : null,
    () => replacementsApi.getAll(token!)
  )
}

export function useRemplacement(id?: number) {
  const { token } = useAuth()
  return useSWR<Remplacement>(
    token && id ? ["remplacement", id, token] : null,
    () => replacementsApi.getById(id!, token!)
  )
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useMessagesByProbleme(problemeId?: number) {
  const { token } = useAuth()
  return useSWR<Message[]>(
    token && problemeId ? ["messages", problemeId, token] : null,
    () => messagesApi.getByProbleme(problemeId!, token!),
    { refreshInterval: 5000 }
  )
}

// ─── Historique ───────────────────────────────────────────────────────────────

export function useHistorique() {
  const { token } = useAuth()
  return useSWR<Historique[]>(
    token ? ["historique", token] : null,
    () => historiqueApi.getAll(token!)
  )
}

export function useHistoriqueByEntity(entity_type?: string, entity_id?: number) {
  const { token } = useAuth()
  return useSWR<Historique[]>(
    token && entity_type && entity_id
      ? ["historique", entity_type, entity_id, token]
      : null,
    () => historiqueApi.getByEntity(entity_type!, entity_id!, token!)
  )
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useUsers() {
  const { token } = useAuth()
  return useSWR<User[]>(
    token ? ["users", token] : null,
    () => usersApi.getAll(token!)
  )
}

export function useUser(id?: number) {
  const { token } = useAuth()
  return useSWR<User>(
    token && id ? ["user", id, token] : null,
    () => usersApi.getById(id!, token!)
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useSettings() {
  const { token } = useAuth()
  return useSWR<Settings>(
    token ? ["settings", token] : null,
    () => settingsApi.get(token!)
  )
}

// Cache invalidation helpers
export function invalidateAffectationsCache(userId?: number) {
  mutate((key) => Array.isArray(key) && key[0] === "affectations")
  if (userId) {
    mutate(["affectations-user", userId])
  }
}

// Hook to handle device replacement with automatic cache refresh
export function useDeviceReplacement() {
  const { token } = useAuth()

  const replaceDevice = async (interventionId: number, userId?: number) => {
    if (!token) throw new Error("Not authenticated")

    const result = await interventionsApi.completeReplacement(interventionId, token!)

    // Invalidate cache so My Devices page updates immediately
    invalidateAffectationsCache(userId)

    return result
  }

  return { replaceDevice, invalidateAffectationsCache }
}