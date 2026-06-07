import React from "react"
import { useRouter } from 'next/navigation';

type Props = {
  open: boolean
  date: Date | null
  onClose: () => void
  hostId?: string
}

export default function CreateBookingModal({ open, date, onClose, hostId }: Props) {
  const router = useRouter();

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white p-4 rounded shadow z-10 w-96">
        <h3 className="text-lg font-semibold">Create Booking</h3>
        <p className="text-sm mt-2">{date ? date.toISOString() : "No date"}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={() => {

            if (!date) return onClose();
            const dateString = date.toISOString().split('T')[0];
            console.log("Booking date:", dateString);
            // prefer passed `hostId` prop; fall back to demo host `1` to avoid 404
            const host = hostId ?? "1";
            router.push(`/book/${host}?date=${dateString}`);
            onClose();
          }}>
            Book
          </button>
        </div>
      </div>
    </div>
  )
}
