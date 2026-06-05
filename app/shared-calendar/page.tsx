import Link from "next/link";
import { ROLE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { getAvailableSlots, getSharedCalendarData } from "@/lib/actions/scheduling";
import { prisma } from "@/lib/prisma";

type CalendarSlot = {
  startTime: string;
  endTime: string;
  booked: number;
  capacity: number;
  available: boolean;
  students: string[];
  categories: string[];
};

type CalendarDay = {
  date: string;
  slots: CalendarSlot[];
};

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

function formatDateLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}（${DAY_LABELS[date.getDay()]}）`;
}

function splitWeeks(dates: string[]) {
  return [dates.slice(0, 7), dates.slice(7, 14)];
}

export default async function SharedCalendarPage({ searchParams }: { searchParams: { category?: string } }) {
  const categories = await prisma.booking.findMany({ distinct: ["category"], select: { category: true } });
  const hosts = await prisma.user.findMany({
    where: { role: { in: [ROLE.TEACHER, ROLE.TA] } },
    select: { id: true, name: true },
  });
  const { dates } = await getSharedCalendarData(searchParams.category);
  const [thisWeekDates, nextWeekDates] = splitWeeks(dates);

  const calendars = await Promise.all(
    hosts.map(async (host) => {
      const days = await Promise.all(
        dates.map(async (date) => {
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

          const slotCells = slots
            .map((slot) => {
              const slotBookings = bookings.filter(
                (booking) => booking.startTime === slot.startTime && booking.endTime === slot.endTime,
              );
              const slotCategories = Array.from(new Set(slotBookings.map((booking) => booking.category)));

              if (searchParams.category && !slotCategories.includes(searchParams.category)) {
                return null;
              }

              return {
                startTime: slot.startTime,
                endTime: slot.endTime,
                booked: slot.booked,
                capacity: slot.capacity,
                available: slot.available,
                students: slotBookings.map((booking) => booking.guest.name),
                categories: slotCategories,
              } satisfies CalendarSlot;
            })
            .filter(Boolean) as CalendarSlot[];

          return { date, slots: slotCells } satisfies CalendarDay;
        }),
      );

      return { host, days };
    }),
  );

  function renderWeek(title: string, weekDates: string[], hostDays: CalendarDay[], hostId: string) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-slate-500">{weekDates[0]} ~ {weekDates[weekDates.length - 1]}</p>
          </div>
          {searchParams.category ? <p className="text-sm text-slate-600">篩選：{searchParams.category}</p> : null}
        </div>
        <div className="grid gap-3 lg:grid-cols-7">
          {weekDates.map((date) => {
            const day = hostDays.find((item) => item.date === date);

            return (
              <Card key={date} className="flex min-h-[14rem] flex-col gap-2">
                <div>
                  <p className="font-medium">{formatDateLabel(date)}</p>
                  <p className="text-xs text-slate-500">{day?.slots.length ?? 0} 個時段</p>
                </div>
                <div className="space-y-2">
                  {day?.slots.length ? (
                    day.slots.map((slot) => (
                      <div
                        key={`${date}-${slot.startTime}-${slot.endTime}`}
                        className={`rounded-md border p-2 text-xs ${slot.available ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {slot.startTime}-{slot.endTime}
                          </span>
                          <span>{slot.booked}/{slot.capacity}</span>
                        </div>
                        <p className="mt-1 text-slate-600">{slot.available ? "可預約" : "已滿"}</p>
                        <p className="mt-1 text-slate-600">學生：{slot.students.join("、") || "-"}</p>
                        <p className="mt-1 text-slate-600">分類：{slot.categories.join("、") || "-"}</p>
                        {slot.available ? (
                          <Link className="mt-2 inline-block text-blue-600 underline" href={`/book/${hostId}?date=${date}`}>
                            前往預約
                          </Link>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">沒有符合條件的時段</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Shared Calendar（本週 + 下週）</h1>
            <p className="text-sm text-slate-500">依 Host 檢視兩週網格，快速比對開放時段、容量與分類標籤。</p>
          </div>
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
      {calendars.map(({ host, days }) => (
        <Card key={host.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{host.name}</h2>
              <p className="text-sm text-slate-500">開放時段以 30 分鐘為單位顯示</p>
            </div>
            <Link className="text-sm text-blue-600 underline" href={`/book/${host.id}`}>
              前往預約頁
            </Link>
          </div>

          {renderWeek("本週", thisWeekDates, days, host.id)}
          {renderWeek("下週", nextWeekDates, days, host.id)}
        </Card>
      ))}
    </main>
  );
}
