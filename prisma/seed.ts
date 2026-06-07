import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role } from '../lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('開始建立種子數據...');

  // Create a teacher
  const hashedPassword = await bcrypt.hash('password123', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      password: hashedPassword,
      name: '吳教授',
      role: Role.TEACHER,
    },
  });

  console.log('✓ 教師帳號已建立:', teacher.email);

  // Create a student
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: hashedPassword,
      name: '李同學',
      role: Role.STUDENT,
    },
  });

  console.log('✓ 學生帳號已建立:', student.email);

  // Create some availabilities for the teacher
  const availabilities = [
    {
      userId: teacher.id,
      isRecurring: true,
      dayOfWeek: 1, // Monday
      startTime: '10:00',
      endTime: '12:00',
      capacity: 3,
    },
    {
      userId: teacher.id,
      isRecurring: true,
      dayOfWeek: 3, // Wednesday
      startTime: '14:00',
      endTime: '16:00',
      capacity: 2,
    },
    {
      userId: teacher.id,
      isRecurring: true,
      dayOfWeek: 5, // Friday
      startTime: '09:00',
      endTime: '11:00',
      capacity: 2,
    },
  ];

  for (const avail of availabilities) {
    await prisma.availability.create({
      data: avail,
    });
  }

  console.log('✓ 開放時段已建立');
  console.log('\n種子數據建立完成！');
  console.log('\n測試帳號:');
  console.log('教師帳號: teacher@example.com / password123');
  console.log('學生帳號: student@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
