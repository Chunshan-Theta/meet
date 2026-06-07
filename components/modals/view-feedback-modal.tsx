'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getFeedbackByBookingId } from '@/lib/actions/feedback';
import { Feedback, Booking } from '@prisma/client';

interface ViewFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
}

export function ViewFeedbackModal({
  open,
  onOpenChange,
  bookingId,
}: ViewFeedbackModalProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && bookingId) {
      setLoading(true);
      getFeedbackByBookingId(bookingId).then((result) => {
        if (result.success) {
          setFeedback(result.feedback || null);
          setBooking(result.booking || null);
        }
        setLoading(false);
      });
    }
  }, [open, bookingId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>會議反饋</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-gray-500">載入中...</div>
        ) : feedback ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-1">會議摘要</h3>
              <p className="text-sm">{feedback.summary}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-1">行動事項</h3>
              <p className="text-sm whitespace-pre-wrap">{feedback.actionItems}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-1">後續目標</h3>
              <p className="text-sm whitespace-pre-wrap">{feedback.goals}</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">尚無反饋</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
