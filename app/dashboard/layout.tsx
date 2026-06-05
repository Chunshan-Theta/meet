import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard/schedule", label: "Schedule" },
  { href: "/dashboard/requests", label: "Requests" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/feedbacks", label: "Feedbacks" },
  { href: "/dashboard/bookings", label: "Bookings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
        <div>
          <p className="text-sm text-slate-500">{session.user.role}</p>
          <h1 className="text-lg font-semibold">{session.user.name}</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-blue-600 underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="outline">
            Logout
          </Button>
        </form>
      </header>
      {children}
    </main>
  );
}
