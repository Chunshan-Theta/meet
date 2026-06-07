import React from "react"

type Props = {
  date: Date
  status: "available" | "booked-me" | "booked-others" | string
  onClick?: () => void
}

const statusClass = (s: string) => {
  if (s === "available") return "bg-emerald-100 border-emerald-300 text-emerald-800"
  if (s === "booked-me") return "bg-blue-100 border-blue-300 text-blue-800"
  if (s === "booked-others") return "bg-red-100 border-red-300 text-red-800"
  return "bg-white border-gray-200"
}

export default function CalendarSlot({ date, status, onClick }: Props) {
  return (
    <div
      className={`p-2 min-h-[80px] border ${statusClass(status)} flex flex-col`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="text-sm font-medium">{date.getDate()}</div>
    </div>
  )
}
