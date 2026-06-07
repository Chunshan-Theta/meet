'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/user';
import { Role, type RoleType } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    role: RoleType;
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: Role.STUDENT,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('密碼不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return;
    }

    startTransition(async () => {
      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(result.error || '註冊失敗');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">註冊</CardTitle>
          <CardDescription>建立新帳號以開始使用系統</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                註冊成功！正在導向登入頁面...
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                placeholder="您的姓名"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value: RoleType) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.STUDENT}>學生</SelectItem>
                  <SelectItem value={Role.TEACHER}>教師</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '註冊中...' : '註冊'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              已經有帳號？{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                登入
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
