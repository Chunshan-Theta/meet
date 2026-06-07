'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

type Result<T> = T & { error?: string };

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<Result<{ success: boolean }>> {
  try {
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: '帳號或密碼錯誤' };
        default:
          return { success: false, error: '登入失敗，請稍後再試' };
      }
    }
    return { success: false, error: '未知錯誤' };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: '/' });
}
