'use client';

import { useState } from 'react';
import { Booking } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeedbackFormModal } from '@/components/modals/feedback-form-modal';

interface FeedbacksManagerProps {
  pendingFeedbacks: (Booking & { host: { name: string } })[];
}

export function FeedbacksManager({ pendingFeedbacks }: FeedbacksManagerProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFillFeedback = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  if (pendingFeedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          目前沒有待填寫的反饋
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pendingFeedbacks.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {(booking.host as any).name} - {booking.topic}
                </span>
                <span className="text-sm font-normal text-gray-600">
                  {booking.date} {booking.startTime}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">類別:</span> {booking.category}
                </div>
                <div>
                  <span className="font-medium">討論主題:</span> {booking.topic}
                </div>
              </div>
              <Button onClick={() => handleFillFeedback(booking)}>
                填寫反饋
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBooking && (
        <FeedbackFormModal
          open={showModal}
          onOpenChange={setShowModal}
          booking={selectedBooking}
        />
      )}
    </>
  );
}
