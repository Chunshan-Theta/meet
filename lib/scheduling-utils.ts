export type Slot = {
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  available: boolean;
};

export function toMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function toTimeLabel(minutes: number) {
  const hour = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (minutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

export function buildSlots(
  availabilities: Array<{ startTime: string; endTime: string; capacity: number }>,
  bookings: Array<{ startTime: string; endTime: string }>,
): Slot[] {
  const slots: Slot[] = [];

  for (const availability of availabilities) {
    const startMinutes = toMinutes(availability.startTime);
    const endMinutes = toMinutes(availability.endTime);

    for (let cursor = startMinutes; cursor + 30 <= endMinutes; cursor += 30) {
      const startTime = toTimeLabel(cursor);
      const endTime = toTimeLabel(cursor + 30);
      const booked = bookings.filter((booking) => booking.startTime === startTime && booking.endTime === endTime).length;
      slots.push({
        startTime,
        endTime,
        capacity: availability.capacity,
        booked,
        available: booked < availability.capacity,
      });
    }
  }

  return slots;
}

export function hasRequiredBookingFields(data: {
  category?: string;
  currentProgress?: string;
  expectedOutcome?: string;
}) {
  return Boolean(data.category && data.currentProgress && data.expectedOutcome);
}
