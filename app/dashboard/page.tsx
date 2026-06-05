import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "STUDENT") {
    redirect("/dashboard/bookings");
  }

  redirect("/dashboard/requests");
}
