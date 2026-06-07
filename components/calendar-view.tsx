'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateBookingModal } from '@/components/modals/create-booking-modal';
import { BookingDetailModal } from '@/components/modals/booking-detail-modal';
import { Role } from '@/lib/constants';
import type { AvailabilityWithCapacity } from '@/lib/actions/scheduling';

interface CalendarViewProps {
  teachers: Array<{ id: string; name: string }>;
  availabilities: AvailabilityWithCapacity[];
  selectedTeacherId: string;
  startDate: string;
  endDate: string;
  currentUserId: string;
  currentUserRole: string;
}

export function CalendarView({
  teachers,
  availabilities,
  selectedTeacherId,
  startDate,
  endDate,
  currentUserId,
  currentUserRole,
}: CalendarViewProps) {
  const router = useRouter();
  const [selectedAvailability, setSelectedAvailability] =
    useState<AvailabilityWithCapacity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleTeacherChange = (teacherId: string) => {
    const params = new URLSearchParams();
    params.set('teacherId', teacherId);
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    router.push(`/shared-calendar?${params.toString()}`);
  };

  const handleAvailabilityClick = (availability: AvailabilityWithCapacity) => {
    setSelectedAvailability(availability);

    // Check if user has bookings in this slot
    const hasBookings = availability.bookings && availability.bookings.length > 0;

    if (hasBookings || currentUserRole === Role.TEACHER) {
      // Show details
      setShowDetailModal(true);
    } else if (currentUserRole === Role.STUDENT && availability.remainingCapacity > 0) {
      // Allow booking
      setShowCreateModal(true);
    }
  };

  const groupedByDate = availabilities.reduce((acc, avail) => {
    if (!acc[avail.date]) {
      acc[avail.date] = [];
    }
    acc[avail.date].push(avail);
    return acc;
  }, {} as Record<string, AvailabilityWithCapacity[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select value={selectedTeacherId} onValueChange={handleTeacherChange}>
            <SelectTrigger>
              <SelectValue placeholder="選擇教師" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-600">
          {startDate} ~ {endDate}
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedByDate).map(([date, avails]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-lg">{date}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {avails.map((avail) => {
                  const myBooking = avail.bookings?.find(
                    (b) => b.guestName === currentUserId
                  );
                  const isFullyBooked = avail.remainingCapacity === 0;

                  return (
                    <Button
                      key={avail.id}
                      variant="outline"
                      className={`h-auto flex-col items-start p-4 ${
                        myBooking
                          ? 'border-blue-500 bg-blue-50'
                          : isFullyBooked
                          ? 'border-red-300 bg-red-50'
                          : 'border-green-300 bg-green-50'
                      }`}
                      onClick={() => handleAvailabilityClick(avail)}
                    >
                      <div className="font-semibold">
                        {avail.startTime} - {avail.endTime}
                      </div>
                      <div className="text-xs text-gray-600">
                        剩餘: {avail.remainingCapacity}/{avail.capacity}
                      </div>
                      {avail.pendingCount > 0 && (
                        <div className="text-xs text-yellow-600">
                          待審核: {avail.pendingCount}
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAvailability && (
        <>
          <CreateBookingModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            availability={selectedAvailability}
            hostId={selectedTeacherId}
            onSuccess={() => {
              setShowCreateModal(false);
              router.refresh();
            }}
          />
          <BookingDetailModal
            open={showDetailModal}
            onOpenChange={setShowDetailModal}
            availability={selectedAvailability}
          />
        </>
      )}
    </div>
  );
}
