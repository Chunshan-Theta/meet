# Database Tables Specification (V2)

## Architecture Notes
- **No Enums in Database**: Due to SQLite limitations, Prisma Enums are not supported. Fields like `role`, `status`, and `category` MUST be defined as `String` in the schema.
- **Type Safety**: The application layer must enforce type safety using the TypeScript constants defined in `lib/constants.ts`. Copilot MUST use these constants instead of magic strings.
- **Physical vs. Virtual Fields**:
  - **Physical Fields**: Actual columns created in the SQLite database (e.g., `userId` as a Foreign Key).
  - **Virtual Relation Fields**: Prisma-specific navigation properties used for joins and queries (e.g., `user` typed as the `User` model). These do not exist as physical columns in SQLite.

## Core Tables

### 1. User
- **Description**: User information table for teachers and students.
- **Physical Fields (Database Columns)**:
  - `id` (String, Primary Key)
  - `email` (String, Unique)
  - `password` (String)
  - `name` (String)
  - `role` (String, Default: "STUDENT") -> *Must map to Role constant: TEACHER, STUDENT*

- **Virtual Relation Fields (Prisma Navigation)**:
  - `availabilities` (Availability[], Relation to Availability table)
  - `bookingsHost` (Booking[], Relation to Booking table as Host)
  - `bookingsGuest` (Booking[], Relation to Booking table as Guest)

### 2. Availability
- **Description**: Time slots opened by teachers for scheduling appointments.
- **Physical Fields (Database Columns)**:
  - `id` (String, Primary Key)
  - `userId` (String, Foreign Key)
  - `isRecurring` (Boolean, Default: true)
  - `dayOfWeek` (Int, Optional)
  - `specificDate` (String, Optional)
  - `startTime` (String)
  - `endTime` (String)
  - `capacity` (Int, Default: 1)
- **Virtual Relation Fields (Prisma Navigation)**:
  - `user` (User, Relation to User table via `userId`)
  - `bookings` (Booking[], Relation to Booking table)

### 3. Booking
- **Description**: Appointment records, mapping a 30-minute precise slot to a broader Availability block.
- **Physical Fields (Database Columns)**:
  - `id` (String, Primary Key)
  - `hostId` (String, Foreign Key)
  - `guestId` (String, Foreign Key)
  - `availabilityId` (String, Foreign Key)
  - `date` (String)
  - `startTime` (String)
  - `endTime` (String)
  - `status` (String, Default: "PENDING") -> *Must map to BookingStatus constant: PENDING, APPROVED, REJECTED, COMPLETED,CANCELLED*
  - `category` (String) -> *Must map to Category constant*
  - `topic` (String)
  - `currentProgress` (String)
  - `expectedOutcome` (String)
  - `attachmentUrl` (String, Optional)
  - `rejectionReason` (String, Optional)
  - `createdAt` (DateTime, Default: now())
- **Virtual Relation Fields (Prisma Navigation)**:
  - `host` (User, Relation to User table via `hostId`)
  - `guest` (User, Relation to User table via `guestId`)
  - `availability` (Availability, Relation to Availability table via `availabilityId`)
  - `feedback` (Feedback?, 1-to-1 Relation to Feedback table)

### 4. Feedback
- **Description**: Post-appointment feedback and action items.
- **Physical Fields (Database Columns)**:
  - `id` (String, Primary Key)
  - `bookingId` (String, Unique, Foreign Key)
  - `summary` (String)
  - `actionItems` (String)
  - `goals` (String)
  - `createdAt` (DateTime, Default: now())
- **Virtual Relation Fields (Prisma Navigation)**:
  - `booking` (Booking, Relation to Booking table via `bookingId`)