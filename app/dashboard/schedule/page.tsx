import { auth } from "@/auth";
import { addAvailability, deleteAvailability } from "@/lib/actions/scheduling";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormInput, FormItem, FormLabel } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const availabilities = await prisma.availability.findMany({
    where: { userId: userId },
    orderBy: [{ isRecurring: "desc" }, { dayOfWeek: "asc" }, { specificDate: "asc" }],
  });

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">新增開放時段</h2>
      <Form
        action={async (formData) => {
          "use server";
          await addAvailability({
            user: { connect: { id: userId } },
            isRecurring: formData.get("isRecurring") === "true",
            dayOfWeek: formData.get("dayOfWeek") ? Number(formData.get("dayOfWeek")) : null,
            specificDate: (formData.get("specificDate") as string) || null,
            startTime: formData.get("startTime") as string,
            endTime: formData.get("endTime") as string,
            capacity: Number(formData.get("capacity") ?? 1),
          });
        }}
      >
        <FormItem>
          <FormLabel>模式</FormLabel>
          <Select name="isRecurring" defaultValue="true">
            <option value="true">每週固定</option>
            <option value="false">單次開放</option>
          </Select>
        </FormItem>
        <FormItem>
          <FormLabel>星期 (0-6)</FormLabel>
          <FormInput name="dayOfWeek" type="number" min={0} max={6} />
        </FormItem>
        <FormItem>
          <FormLabel>特定日期</FormLabel>
          <FormInput name="specificDate" type="date" />
        </FormItem>
        <div className="grid grid-cols-3 gap-3">
          <FormItem>
            <FormLabel>開始</FormLabel>
            <FormInput name="startTime" type="time" required />
          </FormItem>
          <FormItem>
            <FormLabel>結束</FormLabel>
            <FormInput name="endTime" type="time" required />
          </FormItem>
          <FormItem>
            <FormLabel>容量</FormLabel>
            <FormInput name="capacity" type="number" min={1} defaultValue={1} required />
          </FormItem>
        </div>
        <Button type="submit">新增</Button>
      </Form>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>模式</TableCell>
            <TableCell>日期/星期</TableCell>
            <TableCell>時間</TableCell>
            <TableCell>容量</TableCell>
            <TableCell>刪除</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {availabilities.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.isRecurring ? "每週" : "單次"}</TableCell>
              <TableCell>{item.isRecurring ? item.dayOfWeek : item.specificDate}</TableCell>
              <TableCell>
                {item.startTime}-{item.endTime}
              </TableCell>
              <TableCell>{item.capacity}</TableCell>
              <TableCell>
                <form
                  action={async () => {
                    "use server";
                    await deleteAvailability(item.id, userId);
                  }}
                >
                  <Button variant="destructive" type="submit">
                    Delete
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
