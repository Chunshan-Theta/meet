import { NextResponse } from "next/server"
import { getAvailabilitySummary } from "../../../lib/actions/scheduling"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")
    const hostId = searchParams.get("hostId")

    if (!start || !end || !hostId) {
      return NextResponse.json({ error: "start, end and hostId required" }, { status: 400 })
    }

    const result = await getAvailabilitySummary(hostId, start, end)

    return NextResponse.json({ availability: result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
