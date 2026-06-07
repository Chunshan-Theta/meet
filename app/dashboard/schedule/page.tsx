import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import { getHostSchedule } from '@/lib/actions/scheduling';
import { ScheduleManager } from '@/components/schedule-manager';

export default async function SchedulePage() {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.TEACHER) {
    redirect('/dashboard/bookings');
  }

  const availabilities = await getHostSchedule(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">時段管理</h1>
        <p className="text-gray-600">建立和管理您的開放時段</p>
      </div>

      <ScheduleManager availabilities={availabilities} />
    </div>
  );
}
