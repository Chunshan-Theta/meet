export function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function generateCalendarDays(startDate: Date, viewType: string) {
  const start = startOfWeek(startDate)
  const total = viewType === "2weeks" ? 14 : 35
  const days: Date[] = []
  for (let i = 0; i < total; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}
