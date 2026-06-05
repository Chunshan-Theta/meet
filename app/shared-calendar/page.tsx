import Link from "next/link";
import { ROLE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { getAvailableSlots, getSharedCalendarData } from "@/lib/actions/scheduling";
import { prisma } from "@/lib/prisma";

export default async function SharedCalendarPage({ searchParams }: { searchParams: { category?: string } }) {
  const categories = await prisma.booking.findMany({ distinct: ["category"], select: { category: true } });
  const hosts = await prisma.user.findMany({
    where: { role: { in: [ROLE.TEACHER, ROLE.TA] } },
    select: { id: true, name: true },
  });
  const { dates } = await getSharedCalendarData(searchParams.category);

  const rows: Array<{
    hostId: string;
    hostName: string;
    date: string;
    startTime: string;
    endTime: string;
    booked: number;
    capacity: number;
    students: string[];
    categories: string[];
  }> = [];

  for (const host of hosts) {
    for (const date of dates) {
      const [slots, bookings] = await Promise.all([
        getAvailableSlots(host.id, date),
        prisma.booking.findMany({
          where: {
            hostId: host.id,
            date,
            status: { not: "REJECTED" },
          },
          include: { guest: true },
        }),
      ]);

      for (const slot of slots) {
        const slotBookings = bookings.filter((booking) => booking.startTime === slot.startTime && booking.endTime === slot.endTime);
        const slotCategories = Array.from(new Set(slotBookings.map((booking) => booking.category)));

        if (searchParams.category && !slotCategories.includes(searchParams.category)) {
          continue;
        }

        rows.push({
          hostId: host.id,
          hostName: host.name,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          booked: slot.booked,
          capacity: slot.capacity,
          students: slotBookings.map((booking) => booking.guest.name),
          categories: slotCategories,
        });
      }
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-xl font-semibold">Shared Calendar（本週 + 下週）</h1>
          <form className="flex items-center gap-2" method="GET">
            <Select name="category" defaultValue={searchParams.category ?? ""}>
              <option value="">全部分類</option>
              {categories.map((item) => (
                <option key={item.category} value={item.category}>
                  {item.category}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </div>
      </Card>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日期</TableCell>
              <TableCell>時段</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>容量</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>已預約學生</TableCell>
              <TableCell>分類標籤</TableCell>
              <TableCell>預約</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.hostId}-${row.date}-${row.startTime}`}>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  {row.startTime} - {row.endTime}
                </TableCell>
                <TableCell>{row.hostName}</TableCell>
                <TableCell>
                  {row.booked}/{row.capacity}
                </TableCell>
                <TableCell>{row.booked >= row.capacity ? "已滿" : "開放"}</TableCell>
                <TableCell>{row.students.join("、") || "-"}</TableCell>
                <TableCell>{row.categories.join("、") || "-"}</TableCell>
                <TableCell>
                  <Link className="text-blue-600 underline" href={`/book/${row.hostId}?date=${row.date}`}>
                    前往預約
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
