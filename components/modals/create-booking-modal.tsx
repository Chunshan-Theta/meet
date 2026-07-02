'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBooking } from '@/lib/actions/booking';
import { Category } from '@/lib/constants';
import type { AvailabilityWithCapacity } from '@/lib/actions/scheduling';

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availability: AvailabilityWithCapacity;
  hostId: string;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  topic: '',
  agenda: '',
  currentProgress: '',
  expectedOutcome: '',
  attachmentUrl: '',
};

export function CreateBookingModal({
  open,
  onOpenChange,
  availability,
  hostId,
  onSuccess,
}: CreateBookingModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.agenda.trim() && !formData.attachmentUrl.trim()) {
      setError('請填寫討論大綱或提供附件連結（二擇一，不可全空）');
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        hostId,
        availabilityId: availability.id,
        date: availability.date,
        category: Category.THESIS_PROGRESS_DISCUSSION,
        topic: formData.topic,
        agenda: formData.agenda,
        currentProgress: formData.currentProgress,
        expectedOutcome: formData.expectedOutcome,
        attachmentUrl: formData.attachmentUrl || undefined,
      });

      if (result.success) {
        onSuccess();
        setFormData(EMPTY_FORM);
      } else {
        setError(result.error || '建立預約失敗');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>發起論文進度預約</DialogTitle>
          <DialogDescription>
            {availability.date} {availability.startTime} - {availability.endTime}
            　預約類別：{Category.THESIS_PROGRESS_DISCUSSION}
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
              <Label htmlFor="topic">討論主題 *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                placeholder="簡述本次討論的主題"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda">
                討論大綱（Agenda）
                <span className="ml-1 text-xs text-gray-500">
                  ＊與附件連結至少填一項
                </span>
              </Label>
              <Textarea
                id="agenda"
                value={formData.agenda}
                onChange={(e) =>
                  setFormData({ ...formData, agenda: e.target.value })
                }
                rows={4}
                placeholder="列出本次討論的議程與重點項目..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachmentUrl">
                附件連結（PPT / 共編連結）
                <span className="ml-1 text-xs text-gray-500">
                  ＊與討論大綱至少填一項
                </span>
              </Label>
              <Input
                id="attachmentUrl"
                type="url"
                value={formData.attachmentUrl}
                onChange={(e) =>
                  setFormData({ ...formData, attachmentUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentProgress">目前進度 *</Label>
              <Textarea
                id="currentProgress"
                value={formData.currentProgress}
                onChange={(e) =>
                  setFormData({ ...formData, currentProgress: e.target.value })
                }
                rows={3}
                placeholder="說明目前論文進度..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedOutcome">期望結果 *</Label>
              <Textarea
                id="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutcome: e.target.value })
                }
                rows={3}
                placeholder="說明此次討論希望達成的目標..."
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
              {isPending ? '提交中...' : '送出預約'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
