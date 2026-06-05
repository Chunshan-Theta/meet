import Link from "next/link";
import { auth } from "@/auth";
import { checkBookingEligibility } from "@/lib/actions/scheduling";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id },
    include: { host: true, feedback: true },
    orderBy: { createdAt: "desc" },
  });

  const eligibility = await checkBookingEligibility(session.user.id);

  return (
    <div className="space-y-4">
      {!eligibility.eligible && eligibility.blockingBookingId ? (
        <Card className="border-red-200 bg-red-50 text-red-700">
          你有尚未填寫 Feedback 的 COMPLETED 會議。
          <Link className="ml-2 underline" href={`/dashboard/feedbacks?bookingId=${eligibility.blockingBookingId}`}>
            立即填寫
          </Link>
        </Card>
      ) : null}
      <Card>
        <h2 className="mb-3 text-lg font-semibold">我的預約</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Host</TableCell>
              <TableCell>日期</TableCell>
              <TableCell>分類</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>退回理由</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.host.name}</TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell>{booking.category}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>{booking.rejectionReason || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
