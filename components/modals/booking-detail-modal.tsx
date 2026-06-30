'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AvailabilityWithCapacity } from '@/lib/actions/scheduling';

interface BookingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availability: AvailabilityWithCapacity;
  currentUserId?: string;
}

export function BookingDetailModal({
  open,
  onOpenChange,
  availability,
  currentUserId,
}: BookingDetailModalProps) {
  const isMyPendingPreview =
    availability.bookings?.length === 1 &&
    availability.bookings[0].guestId === currentUserId &&
    availability.bookings[0].status === 'PENDING';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>時段詳情</DialogTitle>
          <DialogDescription>
            {availability.date} {availability.startTime} - {availability.endTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="font-medium">總名額:</span> {availability.capacity}
            </div>
            <div>
              <span className="font-medium">剩餘:</span>{' '}
              {availability.remainingCapacity}
            </div>
            {availability.pendingCount > 0 && (
              <div>
                <span className="font-medium">待審核:</span>{' '}
                {availability.pendingCount}
              </div>
            )}
          </div>

          {availability.bookings && availability.bookings.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold">{isMyPendingPreview ? '申請預覽' : '預約列表'}</h3>
              {availability.bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{booking.guestName}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {booking.status === 'PENDING' ? '待審核' : '已核准'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">類別:</span> {booking.category}
                    </div>
                    <div>
                      <span className="font-medium">主題:</span> {booking.topic}
                    </div>
                    <div>
                      <span className="font-medium">目前進度:</span>{' '}
                      {booking.currentProgress}
                    </div>
                    <div>
                      <span className="font-medium">期望結果:</span>{' '}
                      {booking.expectedOutcome}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">此時段尚無預約</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
