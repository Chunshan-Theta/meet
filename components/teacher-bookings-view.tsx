'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, Feedback } from '@prisma/client';
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
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completingBookingId, setCompletingBookingId] = useState<string | null>(null);
  const [teacherComment, setTeacherComment] = useState('');

  const handleCompleteClick = (bookingId: string) => {
    setCompletingBookingId(bookingId);
    setTeacherComment('');
    setShowCompleteDialog(true);
  };

  const handleCompleteConfirm = () => {
    if (!completingBookingId) return;

    startTransition(async () => {
      const result = await completeBooking(completingBookingId, teacherComment || undefined);
      if (result.success) {
        setShowCompleteDialog(false);
        setCompletingBookingId(null);
        setTeacherComment('');
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
                  <span className="font-medium">目前進度:</span>{' '}
                  {booking.currentProgress}
                </div>
                <div>
                  <span className="font-medium">期望結果:</span>{' '}
                  {booking.expectedOutcome}
                </div>
                {(booking as any).agenda && (
                  <div>
                    <span className="font-medium">討論大綱:</span>
                    <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-2 rounded text-gray-700">
                      {(booking as any).agenda}
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
                {(booking as any).teacherComment && (
                  <div>
                    <span className="font-medium">教師反饋:</span>
                    <p className="mt-1 whitespace-pre-wrap bg-amber-50 p-2 rounded text-gray-700">
                      {(booking as any).teacherComment}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {booking.status === BookingStatus.APPROVED && (
                  <>
                    <Button
                      onClick={() => handleCompleteClick(booking.id)}
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
                    查看學生反饋
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete booking dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>標記會議完成</DialogTitle>
            <DialogDescription>
              是否針對本次討論留下教師反饋？反饋將公開至反思牆供全體成員觀摩（選填）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="teacherComment">教師反饋意見（選填）</Label>
            <Textarea
              id="teacherComment"
              value={teacherComment}
              onChange={(e) => setTeacherComment(e.target.value)}
              rows={5}
              placeholder="填寫對此次論文進度討論的觀察、建議或評語..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCompleteConfirm} disabled={isPending}>
              {isPending ? '處理中...' : '確認完成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
