'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Availability } from '@prisma/client';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAvailability, deleteAvailability } from '@/lib/actions/scheduling';
import { getDayOfWeekName } from '@/lib/utils';

interface ScheduleManagerProps {
  availabilities: Availability[];
}

export function ScheduleManager({ availabilities }: ScheduleManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    isRecurring: true,
    dayOfWeek: '1',
    specificDate: '',
    startTime: '09:00',
    endTime: '10:00',
    capacity: '1',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await createAvailability({
        isRecurring: formData.isRecurring,
        dayOfWeek: formData.isRecurring ? parseInt(formData.dayOfWeek) : undefined,
        specificDate: !formData.isRecurring ? formData.specificDate : undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        capacity: parseInt(formData.capacity),
      });

      if (result.success) {
        setShowCreateModal(false);
        router.refresh();
      } else {
        setError(result.error || '建立失敗');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此時段嗎？')) return;

    startTransition(async () => {
      const result = await deleteAvailability(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowCreateModal(true)}>新增開放時段</Button>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availabilities.map((avail) => (
          <Card key={avail.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {avail.isRecurring
                  ? `每${getDayOfWeekName(avail.dayOfWeek!)}`
                  : avail.specificDate}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">時間:</span> {avail.startTime} -{' '}
                {avail.endTime}
              </div>
              <div className="text-sm">
                <span className="font-medium">名額:</span> {avail.capacity}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(avail.id)}
                disabled={isPending}
              >
                刪除
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增開放時段</DialogTitle>
            <DialogDescription>設定您的開放時間</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>時段類型</Label>
                <Select
                  value={formData.isRecurring ? 'recurring' : 'specific'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isRecurring: value === 'recurring' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recurring">週期性</SelectItem>
                    <SelectItem value="specific">單次</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.isRecurring ? (
                <div className="space-y-2">
                  <Label>星期幾</Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) =>
                      setFormData({ ...formData, dayOfWeek: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {getDayOfWeekName(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="specificDate">日期</Label>
                  <Input
                    id="specificDate"
                    type="date"
                    value={formData.specificDate}
                    onChange={(e) =>
                      setFormData({ ...formData, specificDate: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">開始時間</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">結束時間</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">名額</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '建立中...' : '建立'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
