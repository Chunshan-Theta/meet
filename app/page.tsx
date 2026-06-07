import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard/bookings');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          學術排程系統
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          專為學術環境設計的極簡排程與預約平台
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg">登入</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              註冊
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
