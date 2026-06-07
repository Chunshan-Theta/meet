import React from "react"

type Props = {
  open: boolean
  date: Date | null
  onClose: () => void
}

export default function BookingDetailModal({ open, date, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white p-4 rounded shadow z-10 w-96">
        <h3 className="text-lg font-semibold">Booking Detail</h3>
        <p className="text-sm mt-2">{date ? date.toISOString() : "No date"}</p>
        <div className="mt-4 flex justify-end">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
