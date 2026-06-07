import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import { getHostBookings } from '@/lib/actions/booking';
import { getStudentBookings } from '@/lib/actions/booking';
import { TeacherBookingsView } from '@/components/teacher-bookings-view';
import { StudentBookingsView } from '@/components/student-bookings-view';

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === Role.TEACHER) {
    const bookings = await getHostBookings(session.user.id);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">會議紀錄</h1>
          <p className="text-gray-600">管理已確認的預約和完成狀態</p>
        </div>
        <TeacherBookingsView bookings={bookings} />
      </div>
    );
  } else {
    const bookings = await getStudentBookings(session.user.id);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">我的預約</h1>
          <p className="text-gray-600">查看您的預約記錄和狀態</p>
        </div>
        <StudentBookingsView bookings={bookings} />
      </div>
    );
  }
}
