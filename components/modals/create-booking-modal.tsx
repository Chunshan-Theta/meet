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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export function CreateBookingModal({
  open,
  onOpenChange,
  availability,
  hostId,
  onSuccess,
}: CreateBookingModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    category: Category.COURSE_CONSULTATION,
    topic: '',
    currentProgress: '',
    expectedOutcome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await createBooking({
        hostId,
        availabilityId: availability.id,
        date: availability.date,
        category: formData.category,
        topic: formData.topic,
        currentProgress: formData.currentProgress,
        expectedOutcome: formData.expectedOutcome,
      });

      if (result.success) {
        onSuccess();
        setFormData({
          category: Category.COURSE_CONSULTATION,
          topic: '',
          currentProgress: '',
          expectedOutcome: '',
        });
      } else {
        setError(result.error || '建立預約失敗');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>發起預約</DialogTitle>
          <DialogDescription>
            {availability.date} {availability.startTime} - {availability.endTime}
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
              <Label htmlFor="category">預約類別</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">討論主題</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentProgress">目前進度</Label>
              <Textarea
                id="currentProgress"
                value={formData.currentProgress}
                onChange={(e) =>
                  setFormData({ ...formData, currentProgress: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedOutcome">期望結果</Label>
              <Textarea
                id="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutcome: e.target.value })
                }
                rows={3}
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
