'use server';

import { PrismaClient, Booking, Feedback } from '@prisma/client';
import { auth } from '@/auth';
import { Role, BookingStatus } from '@/lib/constants';

const prisma = new PrismaClient();

type Result<T> = T & { error?: string };

export async function getPendingFeedbacks(guestId: string): Promise<Booking[]> {
  try {
    const session = await auth();
    if (!session?.user || session.user.id !== guestId) {
      return [];
    }

    const bookings = await prisma.booking.findMany({
      where: {
        guestId,
        status: BookingStatus.COMPLETED,
        feedback: null,
      },
      include: {
        host: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return bookings as Booking[];
  } catch (error) {
    console.error('Get pending feedbacks error:', error);
    return [];
  }
}

export async function submitFeedback(data: {
  bookingId: string;
  summary: string;
  actionItems: string;
  goals: string;
}): Promise<Result<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.STUDENT) {
      return { success: false, error: '權限不足' };
    }

    // Verify the booking belongs to the student
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking || booking.guestId !== session.user.id) {
      return { success: false, error: '找不到該預約或權限不足' };
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      return { success: false, error: '只能為已完成的預約填寫反饋' };
    }

    // Create feedback
    await prisma.feedback.create({
      data: {
        bookingId: data.bookingId,
        summary: data.summary,
        actionItems: data.actionItems,
        goals: data.goals,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Submit feedback error:', error);
    return { success: false, error: '提交反饋失敗' };
  }
}

export async function getFeedbackByBookingId(
  bookingId: string
): Promise<Result<{ success: boolean; feedback?: Feedback; booking?: Booking }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: '請先登入' };
    }

    // Get booking with feedback
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        feedback: true,
        host: { select: { name: true } },
        guest: { select: { name: true } },
      },
    });

    if (!booking) {
      return { success: false, error: '找不到該預約' };
    }

    // Verify the user is either the host or the guest
    if (booking.hostId !== session.user.id && booking.guestId !== session.user.id) {
      return { success: false, error: '權限不足' };
    }

    return {
      success: true,
      feedback: booking.feedback || undefined,
      booking: booking as Booking,
    };
  } catch (error) {
    console.error('Get feedback by booking ID error:', error);
    return { success: false, error: '取得反饋失敗' };
  }
}

export async function getAllFeedbacks() {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        booking: {
          include: {
            host: { select: { id: true, name: true } },
            guest: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return feedbacks;
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    return [];
  }
}

export async function getTeacherComments() {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    const bookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.COMPLETED,
        NOT: { teacherComment: null },
      },
      select: {
        id: true,
        topic: true,
        date: true,
        startTime: true,
        teacherComment: true,
        host: { select: { id: true, name: true } },
        guest: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return bookings;
  } catch (error) {
    console.error('Get teacher comments error:', error);
    return [];
  }
}
