'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitFeedback } from '@/lib/actions/feedback';
import { Booking } from '@prisma/client';

interface FeedbackFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
}

export function FeedbackFormModal({
  open,
  onOpenChange,
  booking,
}: FeedbackFormModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    summary: '',
    actionItems: '',
    goals: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await submitFeedback({
        bookingId: booking.id,
        summary: formData.summary,
        actionItems: formData.actionItems,
        goals: formData.goals,
      });

      if (result.success) {
        onOpenChange(false);
        setFormData({ summary: '', actionItems: '', goals: '' });
        router.refresh();
      } else {
        setError(result.error || '提交失敗');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>填寫會議反饋</DialogTitle>
          <DialogDescription>
            {booking.date} {booking.startTime} - {booking.topic}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="summary">會議摘要</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                rows={4}
                placeholder="簡述這次會議的重點內容..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionItems">行動事項</Label>
              <Textarea
                id="actionItems"
                value={formData.actionItems}
                onChange={(e) =>
                  setFormData({ ...formData, actionItems: e.target.value })
                }
                rows={4}
                placeholder="列出需要執行的具體行動項目..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">後續目標</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) =>
                  setFormData({ ...formData, goals: e.target.value })
                }
                rows={4}
                placeholder="說明下一階段的學習或研究目標..."
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '提交中...' : '提交反饋'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
