import { json } from "@/lib/server/backend"

export async function POST() {
  return json({ success: true })
}
