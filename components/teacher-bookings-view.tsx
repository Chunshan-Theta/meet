'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, Feedback } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { completeBooking, resolveBooking } from '@/lib/actions/booking';
import { BookingStatus } from '@/lib/constants';
import { ViewFeedbackModal } from '@/components/modals/view-feedback-modal';

interface TeacherBookingsViewProps {
  bookings: (Booking & {
    guest: { name: string; email: string };
    feedback: Feedback | null;
  })[];
}

export function TeacherBookingsView({ bookings }: TeacherBookingsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleComplete = (bookingId: string) => {
    if (!confirm('確定要將此預約標記為完成嗎？')) return;

    startTransition(async () => {
      const result = await completeBooking(bookingId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const handleCancel = (bookingId: string) => {
    if (!confirm('確定要取消此預約嗎？')) return;

    startTransition(async () => {
      const result = await resolveBooking({
        bookingId,
        status: BookingStatus.CANCELLED,
      });
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const handleViewFeedback = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      APPROVED: '已核准',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          目前沒有會議紀錄
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {(booking.guest as any).name} - {booking.topic}
                </span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                  <span className="text-sm font-normal text-gray-600">
                    {booking.date} {booking.startTime}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">類別:</span> {booking.category}
                </div>
                <div>
                  <span className="font-medium">目前進度:</span>{' '}
                  {booking.currentProgress}
                </div>
                <div>
                  <span className="font-medium">期望結果:</span>{' '}
                  {booking.expectedOutcome}
                </div>
              </div>
              <div className="flex gap-2">
                {booking.status === BookingStatus.APPROVED && (
                  <>
                    <Button
                      onClick={() => handleComplete(booking.id)}
                      disabled={isPending}
                    >
                      標記完成
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancel(booking.id)}
                      disabled={isPending}
                    >
                      取消預約
                    </Button>
                  </>
                )}
                {booking.status === BookingStatus.COMPLETED && booking.feedback && (
                  <Button
                    variant="outline"
                    onClick={() => handleViewFeedback(booking)}
                  >
                    查看反饋
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBooking && (
        <ViewFeedbackModal
          open={showFeedbackModal}
          onOpenChange={setShowFeedbackModal}
          bookingId={selectedBooking.id}
        />
      )}
    </>
  );
}
