'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Role } from '@/lib/constants';

interface NavbarProps {
  user: {
    name: string;
    role: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
    });
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              學術排程系統
            </Link>
            <div className="flex gap-4">
              <Link href="/shared-calendar">
                <Button
                  variant={isActive('/shared-calendar') ? 'default' : 'ghost'}
                  size="sm"
                >
                  行事曆
                </Button>
              </Link>
              {user.role === Role.TEACHER && (
                <>
                  <Link href="/dashboard/schedule">
                    <Button
                      variant={isActive('/dashboard/schedule') ? 'default' : 'ghost'}
                      size="sm"
                    >
                      時段管理
                    </Button>
                  </Link>
                  <Link href="/dashboard/requests">
                    <Button
                      variant={isActive('/dashboard/requests') ? 'default' : 'ghost'}
                      size="sm"
                    >
                      審核預約
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/dashboard/bookings">
                <Button
                  variant={isActive('/dashboard/bookings') ? 'default' : 'ghost'}
                  size="sm"
                >
                  {user.role === Role.TEACHER ? '會議紀錄' : '我的預約'}
                </Button>
              </Link>
              {user.role === Role.STUDENT && (
                <Link href="/dashboard/feedbacks">
                  <Button
                    variant={isActive('/dashboard/feedbacks') ? 'default' : 'ghost'}
                    size="sm"
                  >
                    填寫反饋
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role === Role.TEACHER ? '教師' : '學生'})
            </span>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              size="sm"
              disabled={isPending}
            >
              {isPending ? '登出中...' : '登出'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
