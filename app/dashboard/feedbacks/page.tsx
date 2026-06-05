import { auth } from "@/auth";
import { submitFeedback } from "@/lib/actions/scheduling";
import { ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormInput, FormItem, FormLabel, FormTextarea } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

export default async function FeedbacksPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  if (session.user.role !== ROLE.STUDENT) {
    const feedbacks = await prisma.feedback.findMany({
      include: { booking: { include: { guest: true } } },
      orderBy: { createdAt: "desc" },
    });

    const categoryStats = feedbacks.reduce<Record<string, number>>((acc, feedback) => {
      acc[feedback.booking.category] = (acc[feedback.booking.category] ?? 0) + 1;
      return acc;
    }, {});

    return (
      <Card>
        <h2 className="mb-3 text-lg font-semibold">反饋分類列表</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>分類</TableCell>
              <TableCell>反饋數</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(categoryStats).map(([category, count]) => (
              <TableRow key={category}>
                <TableCell>{category}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  const completedWithoutFeedback = await prisma.booking.findMany({
    where: {
      guestId: userId,
      status: "COMPLETED",
      feedback: null,
      ...(searchParams.bookingId ? { id: searchParams.bookingId } : {}),
    },
    include: { host: true },
  });

  const feedbacks = await prisma.feedback.findMany({
    where: { booking: { guestId: userId } },
    include: { booking: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      {completedWithoutFeedback.map((booking) => (
        <Card key={booking.id}>
          <h2 className="mb-3 font-semibold">提交會議反饋（{booking.topic}）</h2>
          <Form
            action={async (formData) => {
              "use server";
              await submitFeedback(booking.id, userId, {
                summary: formData.get("summary") as string,
                actionItems: formData.get("actionItems") as string,
                goals: formData.get("goals") as string,
              });
            }}
          >
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormTextarea name="summary" required />
            </FormItem>
            <FormItem>
              <FormLabel>Action Items</FormLabel>
              <FormTextarea name="actionItems" required />
            </FormItem>
            <FormItem>
              <FormLabel>Goals</FormLabel>
              <FormInput name="goals" required />
            </FormItem>
            <Button type="submit">送出反饋</Button>
          </Form>
        </Card>
      ))}

      <Card>
        <h2 className="mb-3 text-lg font-semibold">已提交反饋</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>會議</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Action Items</TableCell>
              <TableCell>Goals</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>{feedback.booking.topic}</TableCell>
                <TableCell>{feedback.summary}</TableCell>
                <TableCell>{feedback.actionItems}</TableCell>
                <TableCell>{feedback.goals}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
