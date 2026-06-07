import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET() {
  try {
    const hosts = await prisma.user.findMany({
      where: { role: { in: ["TEACHER", "TA"] } },
      select: { id: true, name: true, role: true },
    })

    return NextResponse.json({ hosts })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
