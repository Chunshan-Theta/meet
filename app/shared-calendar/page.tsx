"use client"

import React, { useMemo, useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { generateCalendarDays } from "../../lib/calendar"
import FilterBar from "../../components/calendar/FilterBar"
import CalendarSlot from "../../components/calendar/CalendarSlot"
import CreateBookingModal from "../../components/calendar/CreateBookingModal"
import BookingDetailModal from "../../components/calendar/BookingDetailModal"

type SlotStatus = "available" | "booked-me" | "booked-others"

export default function SharedCalendarPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const view = searchParams.get("view") || "2weeks"
  const hideUnavailable = searchParams.get("hideUnavailable") === "1"

  const [activeModal, setActiveModal] = useState<"create" | "detail" | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [hosts, setHosts] = useState<{ id: string; name: string }[] | null>(null)
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, { availableSlots: number; totalSlots: number }> | null>(null)

  const startDate = useMemo(() => {
    const value = searchParams.get("start")
    return value ? new Date(value) : new Date()
  }, [searchParams])

  const days = useMemo(() => generateCalendarDays(startDate, view), [startDate, view])

  const toDateKey = (d: Date) => d.toISOString().slice(0, 10)

  useEffect(() => {
    if (!days || days.length === 0) return

    const start = toDateKey(days[0])
    const end = toDateKey(days[days.length - 1])
    ;(async () => {
      try {
        const hostId = searchParams.get("hostId")

        if (hostId) {
          const avRes = await fetch(`/api/availability?start=${start}&end=${end}&hostId=${hostId}`)
          if (avRes.ok) {
            const avData = await avRes.json()
            setAvailabilityMap(avData.availability || {})
          } else {
            setAvailabilityMap(null)
          }
        } else {
          setAvailabilityMap(null)
        }
      } catch (err) {
        console.error("Failed to load bookings or availability", err)
      }
    })()
  }, [startDate, view])

  // fetch hosts for selector
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/hosts`)
        if (!res.ok) return
        const data = await res.json()
        setHosts(data.hosts || [])
      } catch (err) {
        console.error("Failed to load hosts", err)
      }
    })()
  }, [])

  const slotStatus = (date: Date): SlotStatus => {
    const key = toDateKey(date)
    const hostId = searchParams.get("hostId")

    if (!hostId) return "booked-others"

    const av = availabilityMap?.[key]
    if (!av) return "booked-others"
    return av.availableSlots > 0 ? "available" : "booked-others"
  }

  const handleSlotClick = (date: Date, status: SlotStatus) => {
    setSelectedSlot(date)
    setActiveModal(status === "available" ? "create" : "detail")
  }

  const updateSearch = (params: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "") {
        nextParams.delete(key)
        return
      }

      nextParams.set(key, value)
    })

    const query = nextParams.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Shared Calendar</h1>
            <p className="mt-1 text-sm text-slate-600">公開共用行事曆，支援雙週 / 單月切換與即時 URL 同步。</p>
          </div>
          <FilterBar
            view={view}
            hideUnavailable={hideUnavailable}
            hosts={hosts ?? undefined}
            hostId={searchParams.get("hostId")}
            onChange={(next) => updateSearch(next)}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
        {days.map((date) => {
          const status = slotStatus(date)

          if (hideUnavailable && status === "booked-others") {
            return (
              <div
                key={date.toISOString()}
                className="min-h-[88px] bg-slate-50 p-3 text-sm text-slate-400"
              >
                {date.getDate()}
              </div>
            )
          }

          return (
            <CalendarSlot
              key={date.toISOString()}
              date={date}
              status={status}
              onClick={() => handleSlotClick(date, status)}
            />
          )
        })}
      </div>

      <CreateBookingModal
        open={activeModal === "create"}
        date={selectedSlot}
        hostId={searchParams.get("hostId") ?? undefined}
        onClose={() => setActiveModal(null)}
      />

      <BookingDetailModal
        open={activeModal === "detail"}
        date={selectedSlot}
        onClose={() => setActiveModal(null)}
      />
    </div>
  )
}
