import bcrypt from "bcryptjs";
import { BOOKING_STATUS, ROLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.teacherTA.deleteMany();
  await prisma.user.deleteMany();

  const [teacherPassword, taPassword, studentPassword] = await Promise.all([
    bcrypt.hash("teacher123", 10),
    bcrypt.hash("ta123", 10),
    bcrypt.hash("student123", 10),
  ]);

  const teacher = await prisma.user.create({
    data: {
      email: "teacher@example.com",
      password: teacherPassword,
      name: "Teacher One",
      role: ROLE.TEACHER,
      availabilities: {
        create: [
          { isRecurring: true, dayOfWeek: 1, startTime: "09:00", endTime: "12:00", capacity: 2 },
          { isRecurring: false, specificDate: "2026-06-12", startTime: "14:00", endTime: "16:00", capacity: 1 },
        ],
      },
    },
  });

  const ta = await prisma.user.create({
    data: {
      email: "ta@example.com",
      password: taPassword,
      name: "TA One",
      role: ROLE.TA,
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@example.com",
      password: studentPassword,
      name: "Student One",
      role: ROLE.STUDENT,
    },
  });

  await prisma.teacherTA.create({ data: { teacherId: teacher.id, taId: ta.id } });

  await prisma.booking.createMany({
    data: [
      {
        hostId: teacher.id,
        guestId: student.id,
        date: "2026-06-09",
        startTime: "09:00",
        endTime: "09:30",
        status: BOOKING_STATUS.APPROVED,
        category: "Code Review",
        topic: "Refactor auth flow",
        currentProgress: "Done with initial prototype",
        expectedOutcome: "Receive review comments",
      },
      {
        hostId: teacher.id,
        guestId: student.id,
        date: "2026-06-10",
        startTime: "10:00",
        endTime: "10:30",
        status: BOOKING_STATUS.PENDING,
        category: "論文進度",
        topic: "Chapter 2 updates",
        currentProgress: "Drafted 70%",
        expectedOutcome: "Confirm next milestones",
      },
      {
        hostId: ta.id,
        guestId: student.id,
        date: "2026-06-11",
        startTime: "15:00",
        endTime: "15:30",
        status: BOOKING_STATUS.PENDING,
        category: "職涯請益",
        topic: "Internship prep",
        currentProgress: "Resume drafted",
        expectedOutcome: "Actionable interview plan",
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
