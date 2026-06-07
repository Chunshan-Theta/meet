'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role, isValidRole } from '@/lib/constants';

const prisma = new PrismaClient();

type Result<T> = T & { error?: string };

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<Result<{ success: boolean }>> {
  try {
    // Validate role
    if (!isValidRole(data.role)) {
      return { success: false, error: '無效的角色類型' };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: '此 Email 已被註冊' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: '註冊失敗，請稍後再試' };
  }
}

export async function getTeachers(): Promise<Array<{ id: string; name: string }>> {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: Role.TEACHER },
      select: { id: true, name: true },
    });

    return teachers;
  } catch (error) {
    console.error('Get teachers error:', error);
    return [];
  }
}
