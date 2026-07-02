// Type Safety Layer for SQLite String Fields
// These constants MUST be used instead of magic strings throughout the application

export const Role = {
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export type RoleType = typeof Role[keyof typeof Role];

export const BookingStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

export const Category = {
  THESIS_PROGRESS_DISCUSSION: '論文進度討論',
} as const;

export type CategoryType = typeof Category[keyof typeof Category];

// Helper function to validate category
export function isValidCategory(value: string): value is CategoryType {
  return Object.values(Category).includes(value as CategoryType);
}

// Helper function to validate booking status
export function isValidBookingStatus(value: string): value is BookingStatusType {
  return Object.values(BookingStatus).includes(value as BookingStatusType);
}

// Helper function to validate role
export function isValidRole(value: string): value is RoleType {
  return Object.values(Role).includes(value as RoleType);
}
