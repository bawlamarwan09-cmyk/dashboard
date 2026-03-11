"use client"

import useSWR from "swr"
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
} from "@/lib/api"

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { token } = useAuth()
  return useSWR<DashboardStats>(
    token ? ["dashboard-stats", token] : null,
    () => dashboardApi.getStats(token as string)
  )
}

export function useDashboardCharts() {
  const { token } = useAuth()
  return useSWR<ChartData>(
    token ? ["dashboard-charts", token] : null,
    () => dashboardApi.getChartData(token as string)
  )
}

// ─── Materiels ────────────────────────────────────────────────────────────────

export function useMateriels() {
  const { token } = useAuth()
  return useSWR<Materiel[]>(
    token ? ["materiels", token] : null,
    () => materielsApi.getAll(token as string)
  )
}

export function useMateriel(id?: number) {
  const { token } = useAuth()
  return useSWR<Materiel>(
    token && id ? ["materiel", id, token] : null,
    () => materielsApi.getById(id as number, token as string)
  )
}

// ─── Affectations ─────────────────────────────────────────────────────────────

export function useAffectations() {
  const { token } = useAuth()
  return useSWR<Affectation[]>(
    token ? ["affectations", token] : null,
    () => affectationsApi.getAll(token as string)
  )
}

export function useAffectationsByMateriel(materielId?: number) {
  const { token } = useAuth()
  return useSWR<Affectation[]>(
    token && materielId ? ["affectations-materiel", materielId, token] : null,
    () => affectationsApi.getByMateriel(materielId as number, token as string)
  )
}

export function useAffectationsByUser(userId?: number) {
  const { token } = useAuth()
  return useSWR<Affectation[]>(
    token && userId ? ["affectations-user", userId, token] : null,
    () => affectationsApi.getByUser(userId as number, token as string)
  )
}

// ─── Problemes ────────────────────────────────────────────────────────────────

export function useProblemes() {
  const { token } = useAuth()
  return useSWR<Probleme[]>(
    token ? ["problemes", token] : null,
    () => problemesApi.getAll(token as string)
  )
}

export function useProbleme(id?: number) {
  const { token } = useAuth()
  return useSWR<Probleme>(
    token && id ? ["probleme", id, token] : null,
    () => problemesApi.getById(id as number, token as string)
  )
}

// ─── Interventions ────────────────────────────────────────────────────────────

export function useInterventions() {
  const { token } = useAuth()
  return useSWR<Intervention[]>(
    token ? ["interventions", token] : null,
    () => interventionsApi.getAll(token as string)
  )
}

export function useIntervention(id?: number) {
  const { token } = useAuth()
  return useSWR<Intervention>(
    token && id ? ["intervention", id, token] : null,
    () => interventionsApi.getById(id as number, token as string)
  )
}

// ─── Remplacements ────────────────────────────────────────────────────────────

export function useRemplacements() {
  const { token } = useAuth()
  return useSWR<Remplacement[]>(
    token ? ["remplacements", token] : null,
    () => replacementsApi.getAll(token as string)
  )
}

export function useRemplacement(id?: number) {
  const { token } = useAuth()
  return useSWR<Remplacement>(
    token && id ? ["remplacement", id, token] : null,
    () => replacementsApi.getById(id as number, token as string)
  )
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useMessagesByProbleme(problemeId?: number) {
  const { token } = useAuth()
  return useSWR<Message[]>(
    token && problemeId ? ["messages", problemeId, token] : null,
    () => messagesApi.getByProbleme(problemeId as number, token as string),
    { refreshInterval: 5000 }
  )
}

// ─── Historique ───────────────────────────────────────────────────────────────

export function useHistorique() {
  const { token } = useAuth()
  return useSWR<Historique[]>(
    token ? ["historique", token] : null,
    () => historiqueApi.getAll(token as string)
  )
}

export function useHistoriqueByEntity(entity_type?: string, entity_id?: number) {
  const { token } = useAuth()
  return useSWR<Historique[]>(
    token && entity_type && entity_id ? ["historique", entity_type, entity_id, token] : null,
    () => historiqueApi.getByEntity(entity_type as string, entity_id as number, token as string)
  )
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useUsers() {
  const { token } = useAuth()
  return useSWR<User[]>(
    token ? ["users", token] : null,
    () => usersApi.getAll(token as string)
  )
}

export function useUser(id?: number) {
  const { token } = useAuth()
  return useSWR<User>(
    token && id ? ["user", id, token] : null,
    () => usersApi.getById(id as number, token as string)
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useSettings() {
  const { token } = useAuth()
  return useSWR<Settings>(
    token ? ["settings", token] : null,
    () => settingsApi.get(token as string)
  )
}