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

  // Default to current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startDate =
    searchParams.startDate || startOfWeek.toISOString().split('T')[0];
  const endDate = searchParams.endDate || endOfWeek.toISOString().split('T')[0];
  const teacherId = searchParams.teacherId || teachers[0]?.id || '';

  const availabilities = teacherId
    ? await getAvailabilities(teacherId, startDate, endDate)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">全公開行事曆</h1>
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
