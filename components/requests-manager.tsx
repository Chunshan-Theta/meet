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

const STANDARD_REASONS = [
  '內容太模糊/不詳細/太簡略',
  '討論事項不明確',
  '進度不夠/無進度',
] as const;

interface RequestsManagerProps {
  requests: (Booking & { guest: { name: string; email: string } })[];
}

export function RequestsManager({ requests }: RequestsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalComment, setAdditionalComment] = useState('');

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
    setSelectedReasons([]);
    setAdditionalComment('');
    setShowRejectModal(true);
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const handleRejectSubmit = () => {
    if (!selectedBooking) return;

    const parts: string[] = [...selectedReasons];
    if (additionalComment.trim()) parts.push(additionalComment.trim());
    const rejectionReason = parts.join('；') || undefined;

    startTransition(async () => {
      const result = await resolveBooking({
        bookingId: selectedBooking.id,
        status: BookingStatus.REJECTED,
        rejectionReason,
      });

      if (result.success) {
        setShowRejectModal(false);
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
                <span className="font-medium">目前進度:</span>{' '}
                {booking.currentProgress}
              </div>
              <div>
                <span className="font-medium">期望結果:</span>{' '}
                {booking.expectedOutcome}
              </div>
              {booking.agenda && (
                <div>
                  <span className="font-medium">討論大綱:</span>
                  <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded text-gray-700">
                    {booking.agenda}
                  </p>
                </div>
              )}
              {booking.attachmentUrl && (
                <div>
                  <span className="font-medium">附件連結:</span>{' '}
                  <a
                    href={booking.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {booking.attachmentUrl}
                  </a>
                </div>
              )}
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
            <DialogDescription>請選擇退件理由（可複選），並可補充說明</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>標準退件理由</Label>
              <div className="space-y-2">
                {STANDARD_REASONS.map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalComment">補充說明（選填）</Label>
              <Textarea
                id="additionalComment"
                value={additionalComment}
                onChange={(e) => setAdditionalComment(e.target.value)}
                rows={3}
                placeholder="如有其他說明請在此補充..."
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
