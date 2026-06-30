'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateBookingModal } from '@/components/modals/create-booking-modal';
import { BookingDetailModal } from '@/components/modals/booking-detail-modal';
import { Role } from '@/lib/constants';
import type { AvailabilityWithCapacity } from '@/lib/actions/scheduling';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ViewMode = '2week' | 'month';

interface CalendarViewProps {
  teachers: Array<{ id: string; name: string }>;
  availabilities: AvailabilityWithCapacity[];
  selectedTeacherId: string;
  startDate: string;
  endDate: string;
  currentUserId: string;
  currentUserRole: string;
}

export function CalendarView({
  teachers,
  availabilities,
  selectedTeacherId,
  startDate,
  endDate,
  currentUserId,
  currentUserRole,
}: CalendarViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('2week');
  const [selectedAvailability, setSelectedAvailability] =
    useState<AvailabilityWithCapacity | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleTeacherChange = (teacherId: string) => {
    const params = new URLSearchParams();
    params.set('teacherId', teacherId);
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    router.push(`/shared-calendar?${params.toString()}`);
  };

  const handleAvailabilityClick = (availability: AvailabilityWithCapacity) => {
    setSelectedAvailability(availability);

    // Check if current user has a booking in this slot
    const hasMyBooking = availability.bookings?.some((b) => b.guestName === currentUserId);

    if (hasMyBooking || currentUserRole === Role.TEACHER) {
      // Show details
      setShowDetailModal(true);
    } else if (currentUserRole === Role.STUDENT && availability.remainingCapacity > 0) {
      // Allow booking
      setShowCreateModal(true);
    }
  };

  // Navigate to previous/next period
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const start = new Date(startDate);
    const days = viewMode === '2week' ? 14 : 30;
    
    if (direction === 'prev') {
      start.setDate(start.getDate() - days);
    } else {
      start.setDate(start.getDate() + days);
    }
    
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    
    const params = new URLSearchParams();
    params.set('teacherId', selectedTeacherId);
    params.set('startDate', start.toISOString().split('T')[0]);
    params.set('endDate', end.toISOString().split('T')[0]);
    router.push(`/shared-calendar?${params.toString()}`);
  };

  // Change view mode
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    const days = mode === '2week' ? 14 : 30;
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    
    const params = new URLSearchParams();
    params.set('teacherId', selectedTeacherId);
    params.set('startDate', start.toISOString().split('T')[0]);
    params.set('endDate', end.toISOString().split('T')[0]);
    router.push(`/shared-calendar?${params.toString()}`);
  };

  // Get period display
  const periodDisplay = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
    const endMonth = end.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
    
    if (startMonth === endMonth) {
      return startMonth;
    }
    return `${startMonth} - ${endMonth}`;
  }, [startDate, endDate]);

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Add empty cells for days before the start date to align with weekday
    const startDayOfWeek = start.getDay(); // 0 = Sunday
    const emptyCells = Array(startDayOfWeek).fill(null);
    
    // Generate actual dates
    const days: (Date | null)[] = [...emptyCells];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }, [startDate, endDate]);

  // Group availabilities by date
  const availabilitiesByDate = useMemo(() => {
    const grouped: Record<string, AvailabilityWithCapacity[]> = {};
    availabilities.forEach(avail => {
      if (!grouped[avail.date]) {
        grouped[avail.date] = [];
      }
      grouped[avail.date].push(avail);
    });
    return grouped;
  }, [availabilities]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-64">
          <Select value={selectedTeacherId} onValueChange={handleTeacherChange}>
            <SelectTrigger>
              <SelectValue placeholder="選擇教師" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === '2week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeViewMode('2week')}
          >
            兩週
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => changeViewMode('month')}
          >
            月份
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePeriod('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium whitespace-nowrap min-w-[180px] text-center">
            {periodDisplay}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePeriod('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-sm text-gray-700 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar cells */}
            {calendarGrid.map((date, index) => {
              // Empty cell for alignment
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[120px] border border-gray-100 rounded-lg bg-gray-50"
                  />
                );
              }

              const dateStr = date.toISOString().split('T')[0];
              const dayAvailabilities = availabilitiesByDate[dateStr] || [];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isFirstDayOfMonth = date.getDate() === 1;

              return (
                <div
                  key={dateStr}
                  className={`min-h-[120px] border rounded-lg p-2 ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isToday ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {isFirstDayOfMonth && (
                      <span className="text-xs mr-1">
                        {date.getMonth() + 1}/
                      </span>
                    )}
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayAvailabilities.map((avail) => {
                      const myBooking = avail.bookings?.find(
                        (b) => b.guestName === currentUserId
                      );
                      const isFullyBooked = avail.remainingCapacity === 0;

                      return (
                        <button
                          key={avail.id}
                          className={`w-full text-xs p-1.5 rounded text-left transition-colors ${
                            myBooking
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : isFullyBooked
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                          onClick={() => !isFullyBooked && handleAvailabilityClick(avail)}
                          disabled={isFullyBooked && !myBooking}
                        >
                          <div className="font-semibold">
                            {avail.startTime}
                          </div>
                          <div className="text-[10px]">
                            {avail.remainingCapacity}/{avail.capacity}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedAvailability && (
        <>
          <CreateBookingModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            availability={selectedAvailability}
            hostId={selectedTeacherId}
            onSuccess={() => {
              setShowCreateModal(false);
              router.refresh();
            }}
          />
          <BookingDetailModal
            open={showDetailModal}
            onOpenChange={setShowDetailModal}
            availability={selectedAvailability}
          />
        </>
      )}
    </div>
  );
}
