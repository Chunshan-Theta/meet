"use server";

import { Prisma } from "@prisma/client";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildSlots, hasRequiredBookingFields } from "@/lib/scheduling-utils";

export type CreateBookingInput = {
  hostId: string;
  guestId: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  topic: string;
  currentProgress: string;
  expectedOutcome: string;
  attachmentUrl?: string;
};

function getDateDayOfWeek(dateString: string) {
  return new Date(`${dateString}T00:00:00`).getDay();
}

export async function checkBookingEligibility(guestId: string) {
  const missingFeedback = await prisma.booking.findFirst({
    where: {
      guestId,
      status: BOOKING_STATUS.COMPLETED,
      feedback: null,
    },
  });

  return { eligible: !missingFeedback, blockingBookingId: missingFeedback?.id };
}

export async function getAvailableSlots(hostId: string, dateString: string) {
  const dayOfWeek = getDateDayOfWeek(dateString);

  const availabilities = await prisma.availability.findMany({
    where: {
      userId: hostId,
      OR: [
        {
          isRecurring: true,
          dayOfWeek,
        },
        {
          isRecurring: false,
          specificDate: dateString,
        },
      ],
    },
    orderBy: [{ startTime: "asc" }],
  });

  const bookings = await prisma.booking.findMany({
    where: {
      hostId,
      date: dateString,
      status: { not: BOOKING_STATUS.REJECTED },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  return buildSlots(availabilities, bookings);
}

export async function createBooking(data: CreateBookingInput) {
  if (!hasRequiredBookingFields(data)) {
    throw new Error("category, currentProgress, expectedOutcome are required");
  }

  const eligibility = await checkBookingEligibility(data.guestId);
  if (!eligibility.eligible) {
    throw new Error("請先完成上一筆已完成會議的反饋");
  }

  const slots = await getAvailableSlots(data.hostId, data.date);
  const requestedSlot = slots.find((slot) => slot.startTime === data.startTime && slot.endTime === data.endTime);

  if (!requestedSlot || !requestedSlot.available) {
    throw new Error("此時段容量已滿或不存在");
  }

  await prisma.booking.create({
    data: {
      ...data,
      status: BOOKING_STATUS.PENDING,
      attachmentUrl: data.attachmentUrl || null,
    },
  });

  revalidatePath("/shared-calendar");
  revalidatePath("/dashboard/bookings");
}

export async function resolveBooking(
  bookingId: string,
  status: BookingStatus,
  reviewerId: string,
  rejectionReason?: string,
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { host: true } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.hostId !== reviewerId) {
    throw new Error("Not authorized to resolve booking");
  }

  if (status === BOOKING_STATUS.REJECTED && !rejectionReason) {
    throw new Error("拒絕時必須填寫 rejectionReason");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      rejectionReason: status === BOOKING_STATUS.REJECTED ? rejectionReason ?? null : null,
    },
  });

  revalidatePath("/dashboard/requests");
  revalidatePath("/dashboard/bookings");
}

export async function submitFeedback(
  bookingId: string,
  guestId: string,
  feedbackData: { summary: string; actionItems: string; goals: string },
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.guestId !== guestId) {
    throw new Error("Not authorized to submit feedback");
  }

  await prisma.feedback.upsert({
    where: { bookingId },
    update: feedbackData,
    create: {
      bookingId,
      ...feedbackData,
    },
  });

  revalidatePath("/dashboard/feedbacks");
}

export async function getSharedCalendarData(category?: string) {
  const now = new Date();
  const start = new Date(now);
  const weekday = start.getDay();
  start.setDate(start.getDate() - weekday);

  const dates: string[] = [];
  for (let i = 0; i < 14; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().slice(0, 10));
  }

  const bookings = await prisma.booking.findMany({
    where: {
      date: { in: dates },
      ...(category ? { category } : {}),
    },
    include: { host: true, guest: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return { dates, bookings };
}

export async function addAvailability(data: Prisma.AvailabilityCreateInput) {
  if (data.isRecurring && data.dayOfWeek == null) {
    throw new Error("Recurring availability must provide dayOfWeek");
  }

  if (!data.isRecurring && !data.specificDate) {
    throw new Error("One-time availability must provide specificDate");
  }

  await prisma.availability.create({ data });
  revalidatePath("/dashboard/schedule");
  revalidatePath("/shared-calendar");
}

export async function deleteAvailability(id: string, userId: string) {
  await prisma.availability.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard/schedule");
}
