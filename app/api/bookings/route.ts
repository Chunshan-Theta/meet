import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    if (!start || !end) {
      return NextResponse.json({ error: "start and end query params required" }, { status: 400 })
    }

    const hostId = searchParams.get("hostId")

    const where: any = {
      date: {
        gte: start,
        lte: end,
      },
    }

    if (hostId) {
      where.hostId = hostId
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        hostId: true,
        guestId: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        topic: true,
      },
    })

    return NextResponse.json({ bookings })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
