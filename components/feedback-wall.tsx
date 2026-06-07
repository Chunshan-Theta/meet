'use client';

import { useState, useMemo } from 'react';
import { Feedback, Booking, User } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FeedbackWithBooking = Feedback & {
  booking: Booking & {
    host: Pick<User, 'id' | 'name'>;
    guest: Pick<User, 'id' | 'name'>;
  };
};

interface FeedbackWallProps {
  feedbacks: FeedbackWithBooking[];
}

export function FeedbackWall({ feedbacks }: FeedbackWallProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackWithBooking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Get unique students
  const students = useMemo(() => {
    const studentMap = new Map<string, string>();
    feedbacks.forEach((feedback) => {
      const guest = feedback.booking.guest;
      studentMap.set(guest.id, guest.name);
    });
    return Array.from(studentMap.entries()).map(([id, name]) => ({ id, name }));
  }, [feedbacks]);

  // Filter feedbacks by selected student
  const filteredFeedbacks = useMemo(() => {
    if (selectedStudent === 'all') {
      return feedbacks;
    }
    return feedbacks.filter(
      (feedback) => feedback.booking.guest.id === selectedStudent
    );
  }, [feedbacks, selectedStudent]);

  // Group feedbacks by student
  const groupedFeedbacks = useMemo(() => {
    const groups = new Map<string, FeedbackWithBooking[]>();
    filteredFeedbacks.forEach((feedback) => {
      const guestId = feedback.booking.guest.id;
      const guestName = feedback.booking.guest.name;
      const key = `${guestId}:${guestName}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(feedback);
    });
    return Array.from(groups.entries()).map(([key, items]) => {
      const [id, name] = key.split(':');
      return { id, name, feedbacks: items };
    });
  }, [filteredFeedbacks]);

  const handleViewDetail = (feedback: FeedbackWithBooking) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const formatDate = (dateStr: string) => {
    return dateStr;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filter and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="選擇學生" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部學生</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600">
              總共 <span className="font-semibold">{filteredFeedbacks.length}</span>{' '}
              筆反饋
            </div>
          </div>
        </div>

        {/* Feedbacks by Student */}
        {groupedFeedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              目前沒有反饋
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedFeedbacks.map((group) => (
              <div key={group.id} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-xl font-semibold">{group.name}</h2>
                  <span className="text-sm text-gray-600">
                    {group.feedbacks.length} 筆反饋
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.feedbacks.map((feedback) => (
                    <Card
                      key={feedback.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewDetail(feedback)}
                    >
                      <CardHeader>
                        <CardTitle className="text-base flex flex-col gap-1">
                          <span className="font-semibold">
                            {feedback.booking.topic}
                          </span>
                          <span className="text-sm font-normal text-gray-600">
                            教師: {feedback.booking.host.name}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <div>
                            {formatDate(feedback.booking.date)}{' '}
                            {feedback.booking.startTime}
                          </div>
                          <div className="mt-1">類別: {feedback.booking.category}</div>
                        </div>
                        <div className="text-sm">
                          <p className="line-clamp-2 text-gray-700">
                            {feedback.summary}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleString('zh-TW')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>反饋詳情</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="space-y-3 border-b pb-4">
                <h3 className="font-semibold text-lg">預約資訊</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">學生:</span>{' '}
                    {selectedFeedback.booking.guest.name}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">教師:</span>{' '}
                    {selectedFeedback.booking.host.name}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">日期:</span>{' '}
                    {formatDate(selectedFeedback.booking.date)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">時間:</span>{' '}
                    {selectedFeedback.booking.startTime} -{' '}
                    {selectedFeedback.booking.endTime}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">類別:</span>{' '}
                    {selectedFeedback.booking.category}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">狀態:</span>{' '}
                    {selectedFeedback.booking.status}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">討論主題:</div>
                  <p>{selectedFeedback.booking.topic}</p>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">目前進度:</div>
                  <p>{selectedFeedback.booking.currentProgress}</p>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">期望成果:</div>
                  <p>{selectedFeedback.booking.expectedOutcome}</p>
                </div>
              </div>

              {/* Feedback Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">會議反饋</h3>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    會議摘要
                  </h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {selectedFeedback.summary}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    行動事項
                  </h4>
                  <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {selectedFeedback.actionItems}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    後續目標
                  </h4>
                  <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {selectedFeedback.goals}
                  </p>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t">
                  反饋時間:{' '}
                  {new Date(selectedFeedback.createdAt).toLocaleString('zh-TW')}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
