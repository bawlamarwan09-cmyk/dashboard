import { NextRequest, NextResponse } from "next/server"
import type { Company, Conversation, Device, Intervention, Message, Problem, Settings, User } from "@/lib/api"

interface StoredUser extends User {
  password: string
}

const now = () => new Date().toISOString()
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

const db: {
  users: StoredUser[]
  devices: Device[]
  problems: Problem[]
  interventions: Intervention[]
  companies: Company[]
  conversations: Conversation[]
  messagesByConversation: Record<string, Message[]>
  settingsByUser: Record<string, Settings>
} = {
  users: [
    {
      id: "user_admin",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      role: "admin",
      company: "HQ",
      createdAt: now(),
      status: "active",
      password: "admin123",
      avatar: "",
    },
    {
      id: "user_tech",
      firstName: "Tech",
      lastName: "Support",
      email: "tech@example.com",
      role: "technician",
      company: "HQ",
      createdAt: now(),
      status: "active",
      password: "tech123",
      avatar: "",
    },
  ],
  devices: [],
  problems: [],
  interventions: [],
  companies: [],
  conversations: [],
  messagesByConversation: {},
  settingsByUser: {},
}

const seedData = () => {
  if (db.devices.length > 0) return

  const company: Company = {
    id: id("company"),
    name: "FixIT Partners",
    type: "repair",
    email: "contact@fixit.com",
    phone: "+1-555-5000",
    address: "101 Service Rd",
    contactPerson: "Claire Brown",
    status: "active",
    createdAt: now(),
  }
  db.companies.push(company)

  const device: Device = {
    id: id("device"),
    name: "Dell Latitude 7420",
    type: "Laptop",
    inventoryNumber: "INV-0001",
    serialNumber: "SN-LAT-7420",
    status: "operational",
    assignedTo: "user_tech",
    assignedToName: "Tech Support",
    location: "IT Floor",
    purchaseDate: "2024-01-10",
    warrantyEnd: "2027-01-10",
    createdAt: now(),
  }
  db.devices.push(device)

  const problem: Problem = {
    id: id("problem"),
    title: "Battery drains quickly",
    description: "Laptop battery drops from 100% to 10% in 45 minutes.",
    deviceId: device.id,
    deviceName: device.name,
    status: "open",
    priority: "high",
    reportedBy: "user_admin",
    reportedByName: "Admin User",
    assignedTo: "user_tech",
    assignedToName: "Tech Support",
    createdAt: now(),
    updatedAt: now(),
    messages: [],
  }
  db.problems.push(problem)

  const intervention: Intervention = {
    id: id("int"),
    type: "internal",
    problemId: problem.id,
    deviceId: device.id,
    deviceName: device.name,
    description: "Run diagnostics and update BIOS",
    status: "pending",
    technician: "user_tech",
    technicianName: "Tech Support",
    startDate: now(),
    cost: 0,
    notes: "Awaiting parts confirmation",
  }
  db.interventions.push(intervention)
}

seedData()

const publicUser = (user: StoredUser): User => {
  const { password, ...safeUser } = user
  return safeUser
}

export const tokenForUser = (userId: string) => `dev-token-${userId}`

export const getUserFromRequest = (request: NextRequest): StoredUser | null => {
  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.replace("Bearer ", "").trim()
  if (!token.startsWith("dev-token-")) return null
  const userId = token.replace("dev-token-", "")
  return db.users.find((user) => user.id === userId) || null
}

export const requireAuth = (request: NextRequest) => {
  const user = getUserFromRequest(request)
  if (!user) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) }
  }
  return { user }
}

export const json = (payload: unknown, status = 200) => NextResponse.json(payload, { status })

export const backend = {
  db,
  publicUser,
  now,
  id,
}
