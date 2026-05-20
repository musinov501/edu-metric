import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AssignMentorTutorDto } from './dto/assign-mentor.dto';
import { ListStudentsQuery } from './dto/list-students.query';
import { Role } from '../common/types/role.enum';
import { Paginated } from '../common/types/paginated';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

const SALT_ROUNDS = 12;
const SORTABLE_FIELDS = new Set([
  'gpa',
  'attendancePercent',
  'overallScore',
  'courseYear',
  'createdAt',
]);

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  /**
   * Admin-only: create both a User (role=STUDENT) and a Student in one transaction.
   */
  async create(dto: CreateStudentDto, actor: AuthenticatedUser): Promise<Student> {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email is already registered');

    const existingStudentId = await this.prisma.student.findUnique({
      where: { studentId: dto.studentId },
    });
    if (existingStudentId) throw new ConflictException('Student ID is already in use');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const student = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
          role: 'STUDENT',
        },
      });
      return tx.student.create({
        data: {
          userId: user.id,
          studentId: dto.studentId,
          faculty: dto.faculty,
          group: dto.group,
          courseYear: dto.courseYear,
          gpa: dto.gpa ?? 0,
          attendancePercent: dto.attendancePercent ?? 0,
        },
      });
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: student.id,
      action: ActivityAction.STUDENT_CREATED,
      description: `Created student ${dto.fullName} (${dto.studentId})`,
      metadata: { faculty: dto.faculty, group: dto.group, courseYear: dto.courseYear },
    });
    return student;
  }

  async findAll(query: ListStudentsQuery, actor: AuthenticatedUser): Promise<Paginated<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.StudentWhereInput = {};
    if (query.faculty) where.faculty = query.faculty;
    if (query.group) where.group = query.group;
    if (query.scholarshipStatus) where.scholarshipStatus = query.scholarshipStatus;
    if (query.search) {
      where.OR = [
        { studentId: { contains: query.search, mode: 'insensitive' } },
        { user: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    // Scope by role
    if (actor.role === Role.MENTOR) {
      const mentor = await this.prisma.mentor.findUnique({
        where: { userId: actor.sub },
        select: { id: true, assignedGroups: true },
      });
      const assignedStudentIds = mentor
        ? (
            await this.prisma.studentAssignment.findMany({
              where: { mentorId: mentor.id },
              select: { studentId: true },
            })
          ).map((s) => s.studentId)
        : [];
      where.OR = [
        ...(where.OR ?? []),
        { id: { in: assignedStudentIds } },
        { group: { in: mentor?.assignedGroups ?? [] } },
      ];
    } else if (actor.role === Role.TUTOR) {
      const tutor = await this.prisma.tutor.findUnique({
        where: { userId: actor.sub },
        select: { id: true, assignedGroups: true },
      });
      const assignedStudentIds = tutor
        ? (
            await this.prisma.studentAssignment.findMany({
              where: { tutorId: tutor.id },
              select: { studentId: true },
            })
          ).map((s) => s.studentId)
        : [];
      where.OR = [
        ...(where.OR ?? []),
        { id: { in: assignedStudentIds } },
        { group: { in: tutor?.assignedGroups ?? [] } },
      ];
    }

    const orderBy = this.parseSort(query.sort);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, fullName: true, email: true, avatar: true } },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string, actor: AuthenticatedUser) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatar: true, createdAt: true } },
        assignments: {
          include: {
            mentor: { include: { user: { select: { fullName: true, email: true } } } },
            tutor: { include: { user: { select: { fullName: true, email: true } } } },
          },
        },
        kpiScores: { orderBy: { computedAt: 'desc' }, take: 1 },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    await this.assertCanRead(student.id, actor);
    return student;
  }

  async update(id: string, dto: UpdateStudentDto, actor: AuthenticatedUser): Promise<Student> {
    const existing = await this.prisma.student.findUnique({ where: { id }, select: { id: true, gpa: true } });
    if (!existing) throw new NotFoundException('Student not found');

    const student = await this.prisma.student.update({
      where: { id },
      data: { ...dto },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: id,
      action: ActivityAction.STUDENT_UPDATED,
      description: `Updated student fields: ${Object.keys(dto).join(', ')}`,
      metadata: { ...dto, previousGpa: existing.gpa },
    });

    if (dto.gpa !== undefined && dto.gpa !== existing.gpa) {
      await this.activityLogs.log({
        actorId: actor.sub,
        targetStudentId: id,
        action: ActivityAction.STUDENT_GPA_CHANGED,
        description: `GPA changed: ${existing.gpa} → ${dto.gpa}`,
        metadata: { oldGpa: existing.gpa, newGpa: dto.gpa },
      });
    }
    return student;
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<{ id: string }> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true, userId: true, user: { select: { fullName: true } } },
    });
    if (!student) throw new NotFoundException('Student not found');

    await this.prisma.user.delete({ where: { id: student.userId } });
    // Student row is cascade-deleted by the User->Student onDelete: Cascade rule.

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: null,
      action: ActivityAction.STUDENT_DELETED,
      description: `Deleted student ${student.user.fullName}`,
      metadata: { deletedStudentId: id },
    });
    return { id };
  }

  /**
   * Assign a mentor and/or tutor to a student. Upserts a single
   * StudentAssignment row per student.
   */
  async assignMentorTutor(id: string, dto: AssignMentorTutorDto, actor: AuthenticatedUser) {
    const student = await this.prisma.student.findUnique({ where: { id }, select: { id: true } });
    if (!student) throw new NotFoundException('Student not found');

    const assignment = await this.prisma.studentAssignment.upsert({
      where: { studentId: id },
      create: { studentId: id, mentorId: dto.mentorId, tutorId: dto.tutorId },
      update: { mentorId: dto.mentorId, tutorId: dto.tutorId },
    });

    if (dto.mentorId) {
      await this.activityLogs.log({
        actorId: actor.sub,
        targetStudentId: id,
        action: ActivityAction.STUDENT_ASSIGNED_MENTOR,
        description: `Assigned mentor to student`,
        metadata: { mentorId: dto.mentorId },
      });
    }
    if (dto.tutorId) {
      await this.activityLogs.log({
        actorId: actor.sub,
        targetStudentId: id,
        action: ActivityAction.STUDENT_ASSIGNED_TUTOR,
        description: `Assigned tutor to student`,
        metadata: { tutorId: dto.tutorId },
      });
    }
    return assignment;
  }

  async getKpiHistory(id: string, actor: AuthenticatedUser, limit = 50) {
    await this.assertCanRead(id, actor);
    return this.prisma.kpiHistory.findMany({
      where: { studentId: id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getActivity(id: string, actor: AuthenticatedUser, limit = 50) {
    await this.assertCanRead(id, actor);
    return this.activityLogs.findByStudent(id, limit);
  }

  // ─────────────────────────────────────────────────────────────
  // Authorization helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Throws ForbiddenException if `actor` may not read this student.
   * Rules:
   *   STUDENT: only their own row
   *   MENTOR/TUTOR: only assigned students or own group
   *   ADMIN/SUPER_ADMIN: anyone
   */
  async assertCanRead(studentId: string, actor: AuthenticatedUser): Promise<void> {
    if (actor.role === Role.ADMIN || actor.role === Role.SUPER_ADMIN) return;
    if (actor.role === Role.STUDENT) {
      if (actor.studentId !== studentId) throw new ForbiddenException('Not your record');
      return;
    }
    // Mentor / Tutor
    const target = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, group: true },
    });
    if (!target) throw new NotFoundException('Student not found');

    if (actor.role === Role.MENTOR) {
      const mentor = await this.prisma.mentor.findUnique({
        where: { userId: actor.sub },
        select: { id: true, assignedGroups: true },
      });
      const assignment = mentor
        ? await this.prisma.studentAssignment.findFirst({
            where: { mentorId: mentor.id, studentId },
          })
        : null;
      if (assignment) return;
      if (mentor?.assignedGroups.includes(target.group)) return;
      throw new ForbiddenException('Student is not assigned to you');
    }
    if (actor.role === Role.TUTOR) {
      const tutor = await this.prisma.tutor.findUnique({
        where: { userId: actor.sub },
        select: { id: true, assignedGroups: true },
      });
      const assignment = tutor
        ? await this.prisma.studentAssignment.findFirst({
            where: { tutorId: tutor.id, studentId },
          })
        : null;
      if (assignment) return;
      if (tutor?.assignedGroups.includes(target.group)) return;
      throw new ForbiddenException('Student is not assigned to you');
    }
    throw new ForbiddenException();
  }

  // ─────────────────────────────────────────────────────────────
  // Internals
  // ─────────────────────────────────────────────────────────────

  private parseSort(sort?: string): Prisma.StudentOrderByWithRelationInput {
    if (!sort) return { overallScore: 'desc' };
    const [field, dirRaw] = sort.split(':');
    const dir: Prisma.SortOrder = dirRaw?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    if (!SORTABLE_FIELDS.has(field)) return { overallScore: 'desc' };
    return { [field]: dir } as Prisma.StudentOrderByWithRelationInput;
  }
}
