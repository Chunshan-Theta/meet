import { auth } from '@/auth';
import { getTeachers } from '@/lib/actions/user';
import { getAvailabilities } from '@/lib/actions/scheduling';
import { CalendarView } from '@/components/calendar-view';

export default async function SharedCalendarPage({
  searchParams,
}: {
  searchParams: { teacherId?: string; startDate?: string; endDate?: string };
}) {
  const session = await auth();
  const teachers = await getTeachers();

  // Default to current 2 weeks
  const today = new Date();
  const startOfPeriod = new Date(today);
  startOfPeriod.setDate(today.getDate() - today.getDay()); // Start from Sunday
  const endOfPeriod = new Date(startOfPeriod);
  endOfPeriod.setDate(startOfPeriod.getDate() + 13); // 2 weeks (14 days total)

  const startDate =
    searchParams.startDate || startOfPeriod.toISOString().split('T')[0];
  const endDate = searchParams.endDate || endOfPeriod.toISOString().split('T')[0];
  const teacherId = searchParams.teacherId || teachers[0]?.id || '';

  const availabilities = teacherId
    ? await getAvailabilities(teacherId, startDate, endDate)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">全公開行事曆</h1>
        <p className="text-gray-600">查看教師的開放時段並發起預約</p>
      </div>

      <CalendarView
        teachers={teachers}
        availabilities={availabilities}
        selectedTeacherId={teacherId}
        startDate={startDate}
        endDate={endDate}
        currentUserId={session?.user?.id || ''}
        currentUserRole={session?.user?.role || ''}
      />
    </div>
  );
}
