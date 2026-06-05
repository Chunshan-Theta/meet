export const ROLE = {
  TEACHER: "TEACHER",
  TA: "TA",
  STUDENT: "STUDENT",
} as const;

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
