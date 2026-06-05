import { BOOKING_STATUS } from "@/lib/constants";
import { auth } from "@/auth";
import { resolveBooking } from "@/lib/actions/scheduling";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

export default async function RequestsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const requests = await prisma.booking.findMany({
    where: { hostId: userId },
    include: { guest: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <h2 className="mb-3 text-lg font-semibold">預約審核</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>學生</TableCell>
            <TableCell>日期</TableCell>
            <TableCell>時段</TableCell>
            <TableCell>分類</TableCell>
            <TableCell>狀態</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.guest.name}</TableCell>
              <TableCell>{request.date}</TableCell>
              <TableCell>
                {request.startTime}-{request.endTime}
              </TableCell>
              <TableCell>{request.category}</TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await resolveBooking(request.id, BOOKING_STATUS.APPROVED, userId);
                    }}
                  >
                    <Button type="submit">Approve</Button>
                  </form>
                  <form
                    action={async (formData) => {
                      "use server";
                      await resolveBooking(
                        request.id,
                        BOOKING_STATUS.REJECTED,
                        userId,
                        (formData.get("rejectionReason") as string) || undefined,
                      );
                    }}
                    className="flex gap-2"
                  >
                    <FormInput name="rejectionReason" placeholder="拒絕理由" required />
                    <Button type="submit" variant="destructive">
                      Reject
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
