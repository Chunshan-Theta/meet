import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-semibold">Meet</Link>
          <nav className="hidden sm:flex space-x-3 text-sm text-slate-600">
            <Link href="/shared-calendar" className="hover:text-slate-900">行事曆</Link>
            <Link href="/book/1" className="hover:text-slate-900">預約</Link>
            <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline">登出</Button>
            </form>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200">登入</Link>
              <Link href="/register" className="px-3 py-1 rounded-md hover:bg-slate-100">註冊</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
