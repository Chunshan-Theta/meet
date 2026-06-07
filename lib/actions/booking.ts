'use server';

import { PrismaClient, Booking } from '@prisma/client';
import { auth } from '@/auth';
import { Role, BookingStatus, isValidCategory } from '@/lib/constants';

const prisma = new PrismaClient();

type Result<T> = T & { error?: string };

export async function checkBookingEligibility(
  guestId: string
): Promise<{ isEligible: boolean; blockReason?: string }> {
  try {
    const session = await auth();
    if (!session?.user || session.user.id !== guestId) {
      return { isEligible: false, blockReason: '權限不足' };
    }

    // Check for completed bookings without feedback
    const completedWithoutFeedback = await prisma.booking.findFirst({
      where: {
        guestId,
        status: BookingStatus.COMPLETED,
        feedback: null,
      },
    });

    if (completedWithoutFeedback) {
      return {
        isEligible: false,
        blockReason: '您有尚未填寫反饋的已完成預約，請先完成反饋才能發起新的預約',
      };
    }

    return { isEligible: true };
  } catch (error) {
    console.error('Check booking eligibility error:', error);
    return { isEligible: false, blockReason: '檢查失敗' };
  }
}

export async function createBooking(data: {
  hostId: string;
  availabilityId: string;
  date: string;
  category: string;
  topic: string;
  currentProgress: string;
  expectedOutcome: string;
}): Promise<Result<{ success: boolean; bookingId?: string }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.STUDENT) {
      return { success: false, error: '權限不足' };
    }

    // Validate category
    if (!isValidCategory(data.category)) {
      return { success: false, error: '無效的預約類別' };
    }

    // Check eligibility
    const eligibility = await checkBookingEligibility(session.user.id);
    if (!eligibility.isEligible) {
      return { success: false, error: eligibility.blockReason };
    }

    // Get availability details to inherit startTime and endTime
    const availability = await prisma.availability.findUnique({
      where: { id: data.availabilityId },
    });

    if (!availability) {
      return { success: false, error: '找不到該時段' };
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        hostId: data.hostId,
        guestId: session.user.id,
        availabilityId: data.availabilityId,
        date: data.date,
        startTime: availability.startTime,
        endTime: availability.endTime,
        status: BookingStatus.PENDING,
        category: data.category,
        topic: data.topic,
        currentProgress: data.currentProgress,
        expectedOutcome: data.expectedOutcome,
      },
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error('Create booking error:', error);
    return { success: false, error: '建立預約失敗' };
  }
}

export async function cancelBooking(
  bookingId: string
): Promise<Result<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.STUDENT) {
      return { success: false, error: '權限不足' };
    }

    // Verify the booking belongs to the student
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.guestId !== session.user.id) {
      return { success: false, error: '找不到該預約或權限不足' };
    }

    // Update status to cancelled
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel booking error:', error);
    return { success: false, error: '取消預約失敗' };
  }
}

export async function resolveBooking(data: {
  bookingId: string;
  status: string;
  rejectionReason?: string;
}): Promise<Result<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.TEACHER) {
      return { success: false, error: '權限不足' };
    }

    // Verify the booking belongs to the teacher
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { availability: true },
    });

    if (!booking || booking.hostId !== session.user.id) {
      return { success: false, error: '找不到該預約或權限不足' };
    }

    // If approving, check remaining capacity
    if (data.status === BookingStatus.APPROVED) {
      const approvedBookings = await prisma.booking.count({
        where: {
          availabilityId: booking.availabilityId,
          date: booking.date,
          status: BookingStatus.APPROVED,
        },
      });

      if (approvedBookings >= booking.availability.capacity) {
        return { success: false, error: '該時段已額滿' };
      }
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: data.bookingId },
      data: {
        status: data.status,
        rejectionReason: data.rejectionReason,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Resolve booking error:', error);
    return { success: false, error: '處理預約失敗' };
  }
}

export async function completeBooking(
  bookingId: string
): Promise<Result<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.TEACHER) {
      return { success: false, error: '權限不足' };
    }

    // Verify the booking belongs to the teacher
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.hostId !== session.user.id) {
      return { success: false, error: '找不到該預約或權限不足' };
    }

    // Update status to completed
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED },
    });

    return { success: true };
  } catch (error) {
    console.error('Complete booking error:', error);
    return { success: false, error: '標記完成失敗' };
  }
}

export async function getStudentBookings(guestId: string): Promise<Booking[]> {
  try {
    const session = await auth();
    if (!session?.user || session.user.id !== guestId) {
      return [];
    }

    const bookings = await prisma.booking.findMany({
      where: { guestId },
      include: {
        host: { select: { name: true } },
        feedback: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings as Booking[];
  } catch (error) {
    console.error('Get student bookings error:', error);
    return [];
  }
}

export async function getHostPendingRequests(hostId: string): Promise<Booking[]> {
  try {
    const session = await auth();
    if (!session?.user || session.user.id !== hostId || session.user.role !== Role.TEACHER) {
      return [];
    }

    const bookings = await prisma.booking.findMany({
      where: {
        hostId,
        status: BookingStatus.PENDING,
      },
      include: {
        guest: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return bookings as Booking[];
  } catch (error) {
    console.error('Get host pending requests error:', error);
    return [];
  }
}

export async function getHostBookings(hostId: string): Promise<Booking[]> {
  try {
    const session = await auth();
    if (!session?.user || session.user.id !== hostId || session.user.role !== Role.TEACHER) {
      return [];
    }

    const bookings = await prisma.booking.findMany({
      where: {
        hostId,
        status: {
          in: [BookingStatus.APPROVED, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        },
      },
      include: {
        guest: { select: { name: true, email: true } },
        feedback: true,
      },
      orderBy: { date: 'desc' },
    });

    return bookings as Booking[];
  } catch (error) {
    console.error('Get host bookings error:', error);
    return [];
  }
}
