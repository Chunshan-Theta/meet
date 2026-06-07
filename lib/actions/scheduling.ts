'use server';

import { PrismaClient, Availability } from '@prisma/client';
import { auth } from '@/auth';
import { Role, BookingStatus } from '@/lib/constants';

const prisma = new PrismaClient();

type Result<T> = T & { error?: string };

export type AvailabilityWithCapacity = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
  pendingCount: number;
  bookings?: Array<{
    id: string;
    guestName: string;
    status: string;
    category: string;
    topic: string;
    currentProgress: string;
    expectedOutcome: string;
  }>;
};

// Helper function to expand recurring availabilities into specific dates
function expandAvailabilities(
  availabilities: Availability[],
  startDate: string,
  endDate: string
): Array<Availability & { date: string }> {
  const expanded: Array<Availability & { date: string }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const avail of availabilities) {
    if (avail.isRecurring && avail.dayOfWeek !== null) {
      // Expand recurring availability
      const current = new Date(start);
      while (current <= end) {
        if (current.getDay() === avail.dayOfWeek) {
          expanded.push({
            ...avail,
            date: current.toISOString().split('T')[0],
          });
        }
        current.setDate(current.getDate() + 1);
      }
    } else if (!avail.isRecurring && avail.specificDate) {
      // Add specific date availability if within range
      const specificDate = new Date(avail.specificDate);
      if (specificDate >= start && specificDate <= end) {
        expanded.push({
          ...avail,
          date: avail.specificDate,
        });
      }
    }
  }

  return expanded;
}

export async function getAvailabilities(
  hostId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityWithCapacity[]> {
  try {
    const session = await auth();
    if (!session?.user) {
      return [];
    }

    // Fetch all availabilities for the host
    const availabilities = await prisma.availability.findMany({
      where: { userId: hostId },
      include: {
        bookings: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              in: [BookingStatus.PENDING, BookingStatus.APPROVED],
            },
          },
          include: {
            guest: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Expand recurring availabilities
    const expandedAvailabilities = expandAvailabilities(
      availabilities,
      startDate,
      endDate
    );

    // Calculate capacity for each expanded availability
    const result: AvailabilityWithCapacity[] = expandedAvailabilities.map((avail) => {
      // Find the original availability with bookings
      const originalAvail = availabilities.find(a => a.id === avail.id);
      const allBookings = originalAvail?.bookings || [];
      
      const bookingsForDate = allBookings.filter((b: any) => b.date === avail.date);
      const approvedCount = bookingsForDate.filter(
        (b: any) => b.status === BookingStatus.APPROVED
      ).length;
      const pendingCount = bookingsForDate.filter(
        (b: any) => b.status === BookingStatus.PENDING
      ).length;

      return {
        id: avail.id,
        date: avail.date,
        startTime: avail.startTime,
        endTime: avail.endTime,
        capacity: avail.capacity,
        remainingCapacity: avail.capacity - approvedCount,
        pendingCount,
        bookings: bookingsForDate.map((b: any) => ({
          id: b.id,
          guestName: b.guest.name,
          status: b.status,
          category: b.category,
          topic: b.topic,
          currentProgress: b.currentProgress,
          expectedOutcome: b.expectedOutcome,
        })),
      };
    });

    return result;
  } catch (error) {
    console.error('Get availabilities error:', error);
    return [];
  }
}

export async function createAvailability(data: {
  isRecurring: boolean;
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
  capacity: number;
}): Promise<Result<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.TEACHER) {
      return { success: false, error: '權限不足' };
    }

    await prisma.availability.create({
      data: {
        userId: session.user.id,
        isRecurring: data.isRecurring,
        dayOfWeek: data.dayOfWeek,
        specificDate: data.specificDate,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Create availability error:', error);
    return { success: false, error: '建立時段失敗' };
  }
}

export async function deleteAvailability(
  availabilityId: string
): Promise<Result<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.TEACHER) {
      return { success: false, error: '權限不足' };
    }

    // Check if there are any approved bookings
    const approvedBookings = await prisma.booking.findFirst({
      where: {
        availabilityId,
        status: BookingStatus.APPROVED,
      },
    });

    if (approvedBookings) {
      return {
        success: false,
        error: '此時段有已核准的預約，無法刪除',
      };
    }

    // Delete the availability (cascade will handle pending bookings)
    await prisma.availability.delete({
      where: { id: availabilityId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete availability error:', error);
    return { success: false, error: '刪除時段失敗' };
  }
}

export async function getHostSchedule(hostId: string): Promise<Availability[]> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.TEACHER) {
      return [];
    }

    // Ensure the user can only access their own schedule
    if (session.user.id !== hostId) {
      return [];
    }

    const availabilities = await prisma.availability.findMany({
      where: { userId: hostId },
      orderBy: [
        { isRecurring: 'desc' },
        { dayOfWeek: 'asc' },
        { specificDate: 'asc' },
      ],
    });

    return availabilities;
  } catch (error) {
    console.error('Get host schedule error:', error);
    return [];
  }
}
