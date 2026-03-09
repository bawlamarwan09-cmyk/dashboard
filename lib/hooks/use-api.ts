"use client"

import useSWR from "swr"
import { useAuth } from "../auth-context"
import {
  devicesApi,
  problemsApi,
  interventionsApi,
  messagesApi,
  usersApi,
  companiesApi,
  dashboardApi,
  Device,
  Problem,
  Intervention,
  Conversation,
  User,
  Company,
  DashboardStats,
  Activity,
  ChartData,
} from "../api"

// Dashboard hooks
export function useDashboardStats() {
  const { token } = useAuth()
  return useSWR<DashboardStats>(
    token ? ["dashboard-stats", token] : null,
    () => dashboardApi.getStats(token!)
  )
}

export function useDashboardActivity() {
  const { token } = useAuth()
  return useSWR<Activity[]>(
    token ? ["dashboard-activity", token] : null,
    () => dashboardApi.getRecentActivity(token!)
  )
}

export function useDashboardCharts() {
  const { token } = useAuth()
  return useSWR<ChartData>(
    token ? ["dashboard-charts", token] : null,
    () => dashboardApi.getChartData(token!)
  )
}

// Devices hooks
export function useDevices() {
  const { token } = useAuth()
  return useSWR<Device[]>(
    token ? ["devices", token] : null,
    () => devicesApi.getAll(token!)
  )
}

export function useDevice(id: string) {
  const { token } = useAuth()
  return useSWR<Device>(
    token && id ? ["device", id, token] : null,
    () => devicesApi.getById(id, token!)
  )
}

export function useMyDevices() {
  const { token } = useAuth()
  return useSWR<Device[]>(
    token ? ["my-devices", token] : null,
    () => devicesApi.getMyDevices(token!)
  )
}

// Problems hooks
export function useProblems() {
  const { token } = useAuth()
  return useSWR<Problem[]>(
    token ? ["problems", token] : null,
    () => problemsApi.getAll(token!)
  )
}

export function useProblem(id: string) {
  const { token } = useAuth()
  return useSWR<Problem>(
    token && id ? ["problem", id, token] : null,
    () => problemsApi.getById(id, token!)
  )
}

// Interventions hooks
export function useInterventions() {
  const { token } = useAuth()
  return useSWR<Intervention[]>(
    token ? ["interventions", token] : null,
    () => interventionsApi.getAll(token!)
  )
}

export function useIntervention(id: string) {
  const { token } = useAuth()
  return useSWR<Intervention>(
    token && id ? ["intervention", id, token] : null,
    () => interventionsApi.getById(id, token!)
  )
}

// Messages hooks
export function useConversations() {
  const { token } = useAuth()
  return useSWR<Conversation[]>(
    token ? ["conversations", token] : null,
    () => messagesApi.getConversations(token!)
  )
}

export function useMessages(conversationId: string) {
  const { token } = useAuth()
  return useSWR(
    token && conversationId ? ["messages", conversationId, token] : null,
    () => messagesApi.getMessages(conversationId, token!),
    { refreshInterval: 5000 } // Auto-refresh every 5 seconds
  )
}

// Users hooks (Admin)
export function useUsers() {
  const { token } = useAuth()
  return useSWR<User[]>(
    token ? ["users", token] : null,
    () => usersApi.getAll(token!)
  )
}

export function useUser(id: string) {
  const { token } = useAuth()
  return useSWR<User>(
    token && id ? ["user", id, token] : null,
    () => usersApi.getById(id, token!)
  )
}

// Companies hooks
export function useCompanies() {
  const { token } = useAuth()
  return useSWR<Company[]>(
    token ? ["companies", token] : null,
    () => companiesApi.getAll(token!)
  )
}

export function useCompany(id: string) {
  const { token } = useAuth()
  return useSWR<Company>(
    token && id ? ["company", id, token] : null,
    () => companiesApi.getById(id, token!)
  )
}
