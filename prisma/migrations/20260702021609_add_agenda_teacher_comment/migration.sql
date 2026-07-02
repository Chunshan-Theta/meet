-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "availabilityId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "agenda" TEXT NOT NULL DEFAULT '',
    "currentProgress" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "rejectionReason" TEXT,
    "teacherComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "Availability" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("attachmentUrl", "availabilityId", "category", "createdAt", "currentProgress", "date", "endTime", "expectedOutcome", "guestId", "hostId", "id", "rejectionReason", "startTime", "status", "topic") SELECT "attachmentUrl", "availabilityId", "category", "createdAt", "currentProgress", "date", "endTime", "expectedOutcome", "guestId", "hostId", "id", "rejectionReason", "startTime", "status", "topic" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
