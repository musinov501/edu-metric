import { Injectable, NotFoundException } from '@nestjs/common';
import { Attendance, AttendanceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActivityAction } from '../activity-logs/activity-action.enum';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { BulkAttendanceDto, MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';

/**
 * Per Group 3: Late attendance reduces partial points.
 * We map status → weight when computing attendance percentage.
 */
const STATUS_WEIGHT: Record<AttendanceStatus, number> = {
  PRESENT: 1,
  EXCUSED: 1,    // doesn't penalize
  LATE: 0.5,
  ABSENT: 0,
};

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogs: ActivityLogsService,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  async mark(dto: MarkAttendanceDto, actor: AuthenticatedUser): Promise<Attendance> {
    await this.assertStudent(dto.studentId);
    const date = new Date(dto.date);

    const record = await this.prisma.attendance.upsert({
      where: {
        studentId_subject_date: {
          studentId: dto.studentId,
          subject: dto.subject,
          date,
        },
      },
      create: {
        studentId: dto.studentId,
        subject: dto.subject,
        date,
        status: dto.status,
        recordedById: actor.sub,
      },
      update: { status: dto.status, recordedById: actor.sub },
    });

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: dto.studentId,
      action: ActivityAction.ATTENDANCE_RECORDED,
      description: `Attendance: ${dto.status} for ${dto.subject} on ${dto.date}`,
      metadata: { subject: dto.subject, date: dto.date, status: dto.status },
    });

    await this.refreshAttendancePercent(dto.studentId, actor);
    return record;
  }

  async bulk(dto: BulkAttendanceDto, actor: AuthenticatedUser) {
    const date = new Date(dto.date);
    const created = await this.prisma.$transaction(
      dto.entries.map((entry) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_subject_date: {
              studentId: entry.studentId,
              subject: dto.subject,
              date,
            },
          },
          create: {
            studentId: entry.studentId,
            subject: dto.subject,
            date,
            status: entry.status,
            recordedById: actor.sub,
          },
          update: { status: entry.status, recordedById: actor.sub },
        }),
      ),
    );

    await this.activityLogs.log({
      actorId: actor.sub,
      targetStudentId: null,
      action: ActivityAction.ATTENDANCE_BULK_RECORDED,
      description: `Bulk attendance: ${dto.subject} on ${dto.date} (${dto.entries.length} students)`,
      metadata: { subject: dto.subject, date: dto.date, count: dto.entries.length },
    });

    // Recompute attendance % for each affected student, sequentially to keep things deterministic.
    const uniqueIds = [...new Set(dto.entries.map((e) => e.studentId))];
    for (const id of uniqueIds) {
      await this.refreshAttendancePercent(id, actor);
    }

    return { count: created.length };
  }

  async findByStudent(studentId: string, actor: AuthenticatedUser) {
    await this.students.assertCanRead(studentId, actor);
    return this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Internals
  // ─────────────────────────────────────────────────────────────

  private async assertStudent(studentId: string) {
    const exists = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Student not found');
  }

  /**
   * Recompute the student's overall attendance percentage from all
   * attendance records and trigger a KPI recalc.
   */
  private async refreshAttendancePercent(studentId: string, actor: AuthenticatedUser) {
    const rows = await this.prisma.attendance.findMany({
      where: { studentId },
      select: { status: true },
    });
    if (rows.length === 0) return;

    const totalWeight = rows.reduce((acc, r) => acc + STATUS_WEIGHT[r.status], 0);
    const percent = Math.round((totalWeight / rows.length) * 10000) / 100; // 2 decimals

    await this.prisma.student.update({
      where: { id: studentId },
      data: { attendancePercent: percent },
    });

    await this.scoring.recalculate(studentId, {
      actorId: actor.sub,
      reason: `Attendance updated (now ${percent}%)`,
    });
  }
}
