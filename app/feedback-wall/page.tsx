import { getAllFeedbacks, getTeacherComments } from '@/lib/actions/feedback';
import { FeedbackWall } from '@/components/feedback-wall';

export default async function FeedbackWallPage() {
  const [feedbacks, teacherComments] = await Promise.all([
    getAllFeedbacks(),
    getTeacherComments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">反饋牆</h1>
        <p className="text-gray-600">查看所有學生的會議反饋與教師評語</p>
      </div>

      <FeedbackWall feedbacks={feedbacks} teacherComments={teacherComments} />
    </div>
  );
}
