import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await prisma.booking.findMany({
    where: { hostId: session.user.id },
    include: { guest: true, feedback: true },
  });

  const stats = bookings.reduce<Record<string, { total: number; completed: number; feedbacks: number }>>((acc, booking) => {
    const key = booking.guest.name;
    if (!acc[key]) {
      acc[key] = { total: 0, completed: 0, feedbacks: 0 };
    }
    acc[key].total += 1;
    if (booking.status === "COMPLETED") {
      acc[key].completed += 1;
    }
    if (booking.feedback) {
      acc[key].feedbacks += 1;
    }
    return acc;
  }, {});

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">學生統計</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>學生</TableCell>
            <TableCell>總預約</TableCell>
            <TableCell>完成數</TableCell>
            <TableCell>已交反饋</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(stats).map(([name, value]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>{value.total}</TableCell>
              <TableCell>{value.completed}</TableCell>
              <TableCell>{value.feedbacks}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
