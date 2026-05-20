/**
 * EduMetric CRM — seed script
 *
 * Phase 1 (current): One user per role so login is testable end-to-end.
 * Phase 2 (later):   50-100 realistic demo students per Group 6 spec —
 *                    top students, at-risk students, students with penalties,
 *                    students with achievements.
 *
 * Run: npm run prisma:seed
 */

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';
const SALT_ROUNDS = 12;

interface SeedUser {
  fullName: string;
  email: string;
  role: Role;
}

const seedUsers: SeedUser[] = [
  { fullName: 'Aziza Karimova',  email: 'student@edumetric.dev',     role: 'STUDENT' },
  { fullName: 'Bekzod Yusupov',  email: 'mentor@edumetric.dev',      role: 'MENTOR' },
  { fullName: 'Dilfuza Sodiqova', email: 'tutor@edumetric.dev',      role: 'TUTOR' },
  { fullName: 'Sherzod Admin',   email: 'admin@edumetric.dev',       role: 'ADMIN' },
  { fullName: 'Root Super',      email: 'superadmin@edumetric.dev',  role: 'SUPER_ADMIN' },
];

async function main() {
  console.log('🌱 Seeding EduMetric demo users...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, role: u.role },
      create: { ...u, passwordHash },
    });

    // Create the role-specific profile row so studentId/mentorId/tutorId resolve.
    if (u.role === 'STUDENT') {
      await prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          studentId: 'DEMO-001',
          faculty: 'Software Engineering',
          group: 'SE-21-01',
          courseYear: 3,
          gpa: 87,
          attendancePercent: 94,
          scholarshipStatus: 'ELIGIBLE',
          overallScore: 84,
        },
      });
    } else if (u.role === 'MENTOR') {
      await prisma.mentor.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, specialization: 'Software Engineering', assignedGroups: ['SE-21-01'] },
      });
    } else if (u.role === 'TUTOR') {
      await prisma.tutor.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, assignedDormitory: 'Dorm A', assignedGroups: ['SE-21-01'] },
      });
    }

    console.log(`  ✓ ${u.role.padEnd(12)} ${u.email}`);
  }

  console.log(`\n🔑 All demo users share the password: ${DEMO_PASSWORD}`);
  console.log('   (override in apps/api/prisma/seed.ts for non-dev environments)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
