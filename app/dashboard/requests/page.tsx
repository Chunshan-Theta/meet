import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import { getHostPendingRequests } from '@/lib/actions/booking';
import { RequestsManager } from '@/components/requests-manager';

export default async function RequestsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.TEACHER) {
    redirect('/dashboard/bookings');
  }

  const pendingRequests = await getHostPendingRequests(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">審核預約</h1>
        <p className="text-gray-600">處理學生的預約申請</p>
      </div>

      <RequestsManager requests={pendingRequests} />
    </div>
  );
}
