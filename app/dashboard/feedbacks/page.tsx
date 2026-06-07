import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@/lib/constants';
import { getPendingFeedbacks } from '@/lib/actions/feedback';
import { FeedbacksManager } from '@/components/feedbacks-manager';

export default async function FeedbacksPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.STUDENT) {
    redirect('/dashboard/bookings');
  }

  const pendingFeedbacks = await getPendingFeedbacks(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">填寫反饋</h1>
        <p className="text-gray-600">為已完成的會議填寫反饋以解除預約限制</p>
      </div>

      <FeedbacksManager pendingFeedbacks={pendingFeedbacks} />
    </div>
  );
}
