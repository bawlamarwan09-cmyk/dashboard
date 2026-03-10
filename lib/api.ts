const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)
  headers.set("Content-Type", "application/json")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    apiFetch<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (token: string) =>
    apiFetch("/auth/logout", {
      method: "POST",
      token,
    }),

  me: (token: string) =>
    apiFetch<User>("/auth/me", { token }),
}

// Devices API
export const devicesApi = {
  getAll: (token: string) =>
    apiFetch<Device[]>("/devices", { token }),

  getById: (id: string, token: string) =>
    apiFetch<Device>(`/devices/${id}`, { token }),

  create: (data: Partial<Device>, token: string) =>
    apiFetch<Device>("/devices", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<Device>, token: string) =>
    apiFetch<Device>(`/devices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiFetch(`/devices/${id}`, {
      method: "DELETE",
      token,
    }),

  getMyDevices: (token: string) =>
    apiFetch<Device[]>("/devices/my", { token }),
}

// Problems API
export const problemsApi = {
  getAll: (token: string) =>
    apiFetch<Problem[]>("/problems", { token }),

  getById: (id: string, token: string) =>
    apiFetch<Problem>(`/problems/${id}`, { token }),

  create: (data: Partial<Problem>, token: string) =>
    apiFetch<Problem>("/problems", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<Problem>, token: string) =>
    apiFetch<Problem>(`/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiFetch(`/problems/${id}`, {
      method: "DELETE",
      token,
    }),

  addMessage: (id: string, message: string, token: string) =>
    apiFetch<Message>(`/problems/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
      token,
    }),
}

// Interventions API
export const interventionsApi = {
  getAll: (token: string) =>
    apiFetch<Intervention[]>("/interventions", { token }),

  getById: (id: string, token: string) =>
    apiFetch<Intervention>(`/interventions/${id}`, { token }),

  create: (data: Partial<Intervention>, token: string) =>
    apiFetch<Intervention>("/interventions", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<Intervention>, token: string) =>
    apiFetch<Intervention>(`/interventions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
}

// Messages API
export const messagesApi = {
  getConversations: (token: string) =>
    apiFetch<Conversation[]>("/messages/conversations", { token }),

  getMessages: (conversationId: string, token: string) =>
    apiFetch<Message[]>(`/messages/conversations/${conversationId}`, { token }),

  send: (conversationId: string, content: string, token: string) =>
    apiFetch<Message>(`/messages/conversations/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({ content }),
      token,
    }),

  createConversation: (recipientId: string, token: string) =>
    apiFetch<Conversation>("/messages/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId }),
      token,
    }),
}

// Users API (Admin)
export const usersApi = {
  getAll: (token: string) =>
    apiFetch<User[]>("/users", { token }),

  getById: (id: string, token: string) =>
    apiFetch<User>(`/users/${id}`, { token }),

  create: (data: Partial<User>, token: string) =>
    apiFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<User>, token: string) =>
    apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiFetch(`/users/${id}`, {
      method: "DELETE",
      token,
    }),
}

// Companies API
export const companiesApi = {
  getAll: (token: string) =>
    apiFetch<Company[]>("/companies", { token }),

  getById: (id: string, token: string) =>
    apiFetch<Company>(`/companies/${id}`, { token }),

  create: (data: Partial<Company>, token: string) =>
    apiFetch<Company>("/companies", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: Partial<Company>, token: string) =>
    apiFetch<Company>(`/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiFetch(`/companies/${id}`, {
      method: "DELETE",
      token,
    }),
}

// Dashboard API
export const dashboardApi = {
  getStats: (token: string) =>
    apiFetch<DashboardStats>("/dashboard/stats", { token }),

  getRecentActivity: (token: string) =>
    apiFetch<Activity[]>("/dashboard/activity", { token }),

  getChartData: (token: string) =>
    apiFetch<ChartData>("/dashboard/charts", { token }),
}

// Settings API
export const settingsApi = {
  get: (token: string) =>
    apiFetch<Settings>("/settings", { token }),

  update: (data: Partial<Settings>, token: string) =>
    apiFetch<Settings>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  updatePassword: (currentPassword: string, newPassword: string, token: string) =>
    apiFetch("/settings/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
    }),
}

// Types
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "admin" | "technician" | "operator" | "user"
  company?: string
  avatar?: string
  createdAt: string
  status: "active" | "inactive"
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  company?: string
  role?: string
}

export interface Device {
  id: string
  name: string
  type: "PC" | "Laptop" | "Monitor" | "Printer" | "Phone" | "Tablet" | "Other"
  inventoryNumber: string
  serialNumber: string
  status: "operational" | "in_repair" | "decommissioned"
  assignedTo?: string
  assignedToName?: string
  location?: string
  purchaseDate?: string
  warrantyEnd?: string
  createdAt: string
}

export interface Problem {
  id: string
  title: string
  description: string
  deviceId: string
  deviceName?: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  reportedBy: string
  reportedByName?: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export interface Intervention {
  id: string
  type: "internal" | "external" | "replacement"
  problemId: string
  deviceId: string
  deviceName?: string
  description: string
  status: "pending" | "in_progress" | "completed"
  technician?: string
  technicianName?: string
  company?: string
  startDate: string
  endDate?: string
  cost?: number
  notes?: string
}

export interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  createdAt: string
  isRead: boolean
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  type: "repair" | "supplier" | "partner"
  email: string
  phone: string
  address?: string
  contactPerson?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface DashboardStats {
  totalDevices: number
  activeProblems: number
  pendingInterventions: number
  resolvedThisMonth: number
  devicesByStatus: { status: string; count: number }[]
  problemsByPriority: { priority: string; count: number }[]
}

export interface Activity {
  id: string
  type: "problem_created" | "problem_resolved" | "device_added" | "intervention_completed"
  description: string
  user: string
  createdAt: string
}

export interface ChartData {
  problemsByMonth: { month: string; count: number }[]
  devicesByType: { type: string; count: number }[]
  interventionsByType: { type: string; count: number }[]
}

export interface Settings {
  profile: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    avatar?: string
  }
  notifications: {
    email: boolean
    push: boolean
    problemUpdates: boolean
    interventionUpdates: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    language: string
  }
}
