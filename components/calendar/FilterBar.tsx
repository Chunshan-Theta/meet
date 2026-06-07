"use client"

import React from "react"

type Props = {
  view: string
  hideUnavailable: boolean
  onChange: (next: Record<string, string | null>) => void
}

type Host = { id: string; name: string }

type PropsWithHost = Props & {
  hosts?: Host[]
  hostId?: string | null
}

export default function FilterBar({ view, /* host removed */ hideUnavailable, onChange, hosts, hostId }: PropsWithHost) {
  return (
    <div className="flex items-center gap-4">
      {hosts ? (
        <label className="flex items-center gap-2">
          Host:
          <select
            value={hostId ?? ""}
            onChange={(e) => onChange({ hostId: e.target.value || null })}
            className="border rounded px-2 py-1"
          >
            <option value="">All hosts</option>
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex items-center gap-2">
        View:
        <select
          value={view}
          onChange={(e) => onChange({ view: e.target.value })}
          className="border rounded px-2 py-1"
        >
          <option value="2weeks">2 Weeks</option>
          <option value="month">1 Month</option>
        </select>
      </label>

      {/* Host filter removed: host is represented by teacher users now */}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hideUnavailable}
          onChange={(e) => onChange({ hideUnavailable: e.target.checked ? "1" : "0" })}
        />
        Hide unavailable
      </label>
    </div>
  )
}
