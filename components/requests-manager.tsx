'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { resolveBooking } from '@/lib/actions/booking';
import { BookingStatus } from '@/lib/constants';

interface RequestsManagerProps {
  requests: (Booking & { guest: { name: string; email: string } })[];
}

export function RequestsManager({ requests }: RequestsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (booking: Booking) => {
    if (!confirm('確定要核准此預約嗎？')) return;

    startTransition(async () => {
      const result = await resolveBooking({
        bookingId: booking.id,
        status: BookingStatus.APPROVED,
      });

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const handleReject = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!selectedBooking) return;

    startTransition(async () => {
      const result = await resolveBooking({
        bookingId: selectedBooking.id,
        status: BookingStatus.REJECTED,
        rejectionReason,
      });

      if (result.success) {
        setShowRejectModal(false);
        setRejectionReason('');
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          目前沒有待審核的預約
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>
                {(booking.guest as any).name} - {booking.topic}
              </span>
              <span className="text-sm font-normal text-gray-600">
                {booking.date} {booking.startTime}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Email:</span>{' '}
                {(booking.guest as any).email}
              </div>
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
              <Button
                onClick={() => handleApprove(booking)}
                disabled={isPending}
              >
                核准
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(booking)}
                disabled={isPending}
              >
                拒絕
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒絕預約</DialogTitle>
            <DialogDescription>請說明拒絕原因（選填）</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">拒絕原因</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isPending}
            >
              確認拒絕
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
