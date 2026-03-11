const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

interface FetchOptions extends RequestInit {
  token?: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || `HTTP error! status: ${response.status}`)
  }

  if (result && typeof result === "object" && "data" in result) {
    return (result as ApiResponse<T>).data
  }

  return result as T
}

// ─── Enums (mirror Prisma enums) ─────────────────────────────────────────────

export type Role = "USER" | "OPERATOR" | "COMPANY" | "ADMIN"

export type ProblemeStatus =
  | "DECLARED"
  | "UNDER_VERIFICATION"
  | "SENT_TO_COMPANY"
  | "REPAIRED"
  | "REPLACED"
  | "CLOSED"

export type InterventionResult = "REPAIRED" | "REPLACED"

// ─── Models (mirror Prisma models) ───────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  role: Role
  created_at: string
}

export interface Materiel {
  id: number
  type: string
  marque: string
  modele: string
  code_onee: string
  numero_serie: string
  numero_inventaire: string
  date_arrive_drr: string
}

export interface Affectation {
  id: number
  materiel_id: number
  user_id: number
  entite: string
  agence: string
  secteur: string
  centre: string
  date_debut: string
  date_fin?: string | null
  materiel?: Materiel
  user?: User
}

export interface Probleme {
  id: number
  materiel_id: number
  declared_by_user_id: number
  description: string
  status: ProblemeStatus
  created_at: string
  updated_at: string
  materiel?: Materiel
  declaredBy?: User
  interventions?: Intervention[]
  messages?: Message[]
}

export interface Intervention {
  id: number
  probleme_id: number
  operator_id: number
  company_id?: number | null
  repare_par_admin: boolean
  diagnostic?: string | null
  date_envoi_entreprise?: string | null
  reference_envoi?: string | null
  date_retour_drr?: string | null
  reference_retour?: string | null
  resultat?: InterventionResult | null
  date_intervention?: string | null
  date_retour_final?: string | null
  probleme?: Probleme
  operator?: User
  company?: User | null
  remplacements?: Remplacement[]
}

export interface Remplacement {
  id: number
  intervention_id: number
  ancien_materiel_id: number
  nouveau_marque: string
  nouveau_modele: string
  nouveau_code_onee: string
  nouveau_numero_serie: string
  intervention?: Intervention
  ancienMateriel?: Materiel
}

export interface Message {
  id: number
  probleme_id: number
  sender_id: number
  receiver_id: number
  message: string
  created_at: string
  sender?: User
  receiver?: User
  probleme?: Probleme
}

export interface Historique {
  id: number
  user_id: number
  action: string
  entity_type: string
  entity_id: number
  details?: string | null
  created_at: string
  user?: User
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: Role
}

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

  me: (token: string) =>
    apiFetch<User>("/auth/me", { token }),

  logout: async (): Promise<boolean> => true,
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (token: string) =>
    apiFetch<User[]>("/users", { token }),

  getById: (id: number, token: string) =>
    apiFetch<User>(`/users/${id}`, { token }),

  create: (data: Omit<User, "id" | "created_at"> & { password: string }, token: string) =>
    apiFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: number, data: Partial<Omit<User, "id" | "created_at">>, token: string) =>
    apiFetch<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: number, token: string) =>
    apiFetch<void>(`/users/${id}`, { method: "DELETE", token }),
}

// ─── Materiels ────────────────────────────────────────────────────────────────

export const materielsApi = {
  getAll: (token: string) =>
    apiFetch<Materiel[]>("/materiels", { token }),

  getById: (id: number, token: string) =>
    apiFetch<Materiel>(`/materiels/${id}`, { token }),

  create: (data: Omit<Materiel, "id">, token: string) =>
    apiFetch<Materiel>("/materiels", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: number, data: Partial<Omit<Materiel, "id">>, token: string) =>
    apiFetch<Materiel>(`/materiels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: number, token: string) =>
    apiFetch<void>(`/materiels/${id}`, { method: "DELETE", token }),
}

// ─── Affectations ─────────────────────────────────────────────────────────────

export const affectationsApi = {
  getAll: (token: string) =>
    apiFetch<Affectation[]>("/affectations", { token }),

  getById: (id: number, token: string) =>
    apiFetch<Affectation>(`/affectations/${id}`, { token }),

  getByMateriel: (materielId: number, token: string) =>
    apiFetch<Affectation[]>(`/affectations/materiel/${materielId}`, { token }),

  getByUser: (userId: number, token: string) =>
    apiFetch<Affectation[]>(`/affectations/user/${userId}`, { token }),

  create: (data: Omit<Affectation, "id" | "materiel" | "user">, token: string) =>
    apiFetch<Affectation>("/affectations", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (id: number, data: Partial<Omit<Affectation, "id" | "materiel" | "user">>, token: string) =>
    apiFetch<Affectation>(`/affectations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: number, token: string) =>
    apiFetch<void>(`/affectations/${id}`, { method: "DELETE", token }),
}

// ─── Problemes ────────────────────────────────────────────────────────────────

export const problemesApi = {
  getAll: (token: string) =>
    apiFetch<Probleme[]>("/problemes", { token }),

  getById: (id: number, token: string) =>
    apiFetch<Probleme>(`/problemes/${id}`, { token }),

  create: (
    data: { materiel_id: number; description: string },
    token: string
  ) =>
    apiFetch<Probleme>("/problemes", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateStatus: (id: number, status: ProblemeStatus, token: string) =>
    apiFetch<Probleme>(`/problemes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      token,
    }),

  delete: (id: number, token: string) =>
    apiFetch<void>(`/problemes/${id}`, { method: "DELETE", token }),
}

// ─── Interventions ────────────────────────────────────────────────────────────

export const interventionsApi = {
  getAll: (token: string) =>
    apiFetch<Intervention[]>("/interventions", { token }),

  getById: (id: number, token: string) =>
    apiFetch<Intervention>(`/interventions/${id}`, { token }),

  create: (
    data: {
      probleme_id: number
      operator_id: number
      company_id?: number
      diagnostic?: string
    },
    token: string
  ) =>
    apiFetch<Intervention>("/interventions", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (
    id: number,
    data: Partial<
      Pick<
        Intervention,
        | "company_id"
        | "repare_par_admin"
        | "diagnostic"
        | "date_envoi_entreprise"
        | "reference_envoi"
        | "date_retour_drr"
        | "reference_retour"
        | "resultat"
        | "date_intervention"
        | "date_retour_final"
      >
    >,
    token: string
  ) =>
    apiFetch<Intervention>(`/interventions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),
}

// ─── Remplacements ────────────────────────────────────────────────────────────

export const replacementsApi = {
  getAll: (token: string) =>
    apiFetch<Remplacement[]>("/remplacements", { token }),

  getById: (id: number, token: string) =>
    apiFetch<Remplacement>(`/remplacements/${id}`, { token }),

  create: (
    data: Omit<Remplacement, "id" | "intervention" | "ancienMateriel">,
    token: string
  ) =>
    apiFetch<Remplacement>("/remplacements", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesApi = {
  getByProbleme: (problemeId: number, token: string) =>
    apiFetch<Message[]>(`/problemes/${problemeId}/messages`, { token }),

  send: (
    data: { probleme_id: number; receiver_id: number; message: string },
    token: string
  ) =>
    apiFetch<Message>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
}

// ─── Historique ───────────────────────────────────────────────────────────────

export const historiqueApi = {
  getAll: (token: string) =>
    apiFetch<Historique[]>("/historique", { token }),

  getByEntity: (entity_type: string, entity_id: number, token: string) =>
    apiFetch<Historique[]>(`/historique/${entity_type}/${entity_id}`, { token }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalMateriels: number
  activeProblemes: number
  pendingInterventions: number
  resolvedThisMonth: number
  problemesByStatus: { status: ProblemeStatus; count: number }[]
  materielsByType: { type: string; count: number }[]
}

export interface ChartData {
  problemesByMonth: { month: string; count: number }[]
  interventionsByResult: { result: InterventionResult; count: number }[]
  materielsByType: { type: string; count: number }[]
}

export const dashboardApi = {
  getStats: (token: string) =>
    apiFetch<DashboardStats>("/dashboard/stats", { token }),

  getChartData: (token: string) =>
    apiFetch<ChartData>("/dashboard/charts", { token }),
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Settings {
  profile: {
    name: string
    email: string
  }
  notifications: {
    email: boolean
    problemUpdates: boolean
    interventionUpdates: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    language: string
  }
}

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
    apiFetch<void>("/settings/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
      token,
    }),
}