import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormInput, FormItem, FormLabel, FormTextarea } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { checkBookingEligibility, createBooking, getAvailableSlots } from "@/lib/actions/scheduling";
import { prisma } from "@/lib/prisma";

const CATEGORY_OPTIONS = ["Code Review", "論文進度", "職涯請益"];

export default async function BookHostPage({
  params,
  searchParams,
}: {
  params: { hostId: string };
  searchParams: { date?: string; error?: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  const selectedDate = searchParams.date ?? new Date().toISOString().slice(0, 10);
  const slots = await getAvailableSlots(params.hostId, selectedDate);
  const host = await prisma.user.findUnique({ where: { id: params.hostId } });
  const eligibility = await checkBookingEligibility(userId);

  async function submitBooking(formData: FormData) {
    "use server";

    const slot = (formData.get("slot") as string).split("|");
    const startTime = slot[0];
    const endTime = slot[1];

    try {
      await createBooking({
        hostId: params.hostId,
        guestId: userId,
        date: formData.get("date") as string,
        startTime,
        endTime,
        category: formData.get("category") as string,
        topic: formData.get("topic") as string,
        currentProgress: formData.get("currentProgress") as string,
        expectedOutcome: formData.get("expectedOutcome") as string,
        attachmentUrl: (formData.get("attachmentUrl") as string) || undefined,
      });
      redirect("/dashboard/bookings");
    } catch (error) {
      const message = error instanceof Error ? error.message : "預約失敗";
      redirect(`/book/${params.hostId}?date=${formData.get("date")}&error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <Card>
        <h1 className="text-xl font-semibold">預約 {host?.name ?? "Host"}</h1>
        {!eligibility.eligible ? (
          <p className="mt-2 text-sm text-red-600">你有未填寫反饋的 COMPLETED 會議，暫時無法新增預約。</p>
        ) : null}
      </Card>

      <Card>
        <form className="flex items-end gap-2" method="GET">
          <div className="flex-1">
            <FormLabel>日期</FormLabel>
            <FormInput name="date" type="date" defaultValue={selectedDate} />
          </div>
          <Button type="submit" variant="outline">
            查詢時段
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">可用時段（30 分鐘）</h2>
        <ul className="space-y-1 text-sm">
          {slots.map((slot) => (
            <li key={`${slot.startTime}-${slot.endTime}`}>
              {slot.startTime}-{slot.endTime}（{slot.booked}/{slot.capacity}） {slot.available ? "可預約" : "已滿"}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">建立預約</h2>
        <Form action={submitBooking}>
          <FormInput name="date" type="hidden" value={selectedDate} />
          <FormItem>
            <FormLabel>時段</FormLabel>
            <Select name="slot" required>
              {slots
                .filter((slot) => slot.available)
                .map((slot) => (
                  <option key={`${slot.startTime}-${slot.endTime}`} value={`${slot.startTime}|${slot.endTime}`}>
                    {slot.startTime}-{slot.endTime}
                  </option>
                ))}
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel>分類</FormLabel>
            <Select name="category" required>
              <option value="">請選擇</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem>
            <FormLabel>主題</FormLabel>
            <FormInput name="topic" required />
          </FormItem>
          <FormItem>
            <FormLabel>目前進度 / 卡關點</FormLabel>
            <FormTextarea name="currentProgress" required />
          </FormItem>
          <FormItem>
            <FormLabel>預期產出 (DoD)</FormLabel>
            <FormTextarea name="expectedOutcome" required />
          </FormItem>
          <FormItem>
            <FormLabel>附件 URL (optional)</FormLabel>
            <FormInput name="attachmentUrl" type="url" />
          </FormItem>
          {searchParams.error ? <p className="text-sm text-red-600">{searchParams.error}</p> : null}
          <Button type="submit" disabled={!eligibility.eligible || slots.filter((slot) => slot.available).length === 0}>
            送出預約
          </Button>
        </Form>
      </Card>
    </main>
  );
}
