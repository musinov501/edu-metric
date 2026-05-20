import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { ScoringService } from '../scoring/scoring.service';
import { AuthenticatedUser } from '../auth/strategies/jwt-payload.interface';
import { riskLevelFor } from './risk-level';

export interface StudentInsight {
  riskLevel: 'EXCELLENT' | 'STRONG' | 'AT_RISK' | 'CRITICAL';
  scholarshipProbability: number; // 0..100
  insights: string[];
  source: 'openai' | 'gemini' | 'rule-based';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai?: OpenAI;
  private readonly geminiKey?: string;
  private readonly provider: 'openai' | 'gemini' | 'rule-based';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
    private readonly scoring: ScoringService,
  ) {
    const openaiKey = config.get<string>('OPENAI_API_KEY');
    const geminiKey = config.get<string>('GEMINI_API_KEY');
    const wanted = (config.get<string>('AI_PROVIDER') ?? 'openai') as 'openai' | 'gemini';

    if (wanted === 'openai' && openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.provider = 'openai';
    } else if (wanted === 'gemini' && geminiKey) {
      this.geminiKey = geminiKey;
      this.provider = 'gemini';
    } else {
      this.logger.warn(
        `No AI key configured for provider "${wanted}" — falling back to rule-based insights.`,
      );
      this.provider = 'rule-based';
    }
  }

  async studentInsights(studentId: string, actor: AuthenticatedUser): Promise<StudentInsight> {
    await this.students.assertCanRead(studentId, actor);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { fullName: true } },
        kpiScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        kpiHistory: { orderBy: { timestamp: 'desc' }, take: 5 },
        achievements: { where: { status: 'APPROVED' }, take: 5 },
        penalties: { take: 5 },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const finalScore = student.overallScore;
    const riskLevel = riskLevelFor(finalScore);
    const scholarshipProbability = this.computeProbability(finalScore, student.gpa);

    const ruleBased = this.ruleBasedInsights(student);
    if (this.provider === 'rule-based') {
      return { riskLevel, scholarshipProbability, insights: ruleBased, source: 'rule-based' };
    }

    try {
      const llmInsights = await this.llmInsights(student, finalScore, scholarshipProbability);
      return { riskLevel, scholarshipProbability, insights: llmInsights, source: this.provider };
    } catch (err) {
      this.logger.error('AI provider call failed; using rule-based fallback', err as Error);
      return { riskLevel, scholarshipProbability, insights: ruleBased, source: 'rule-based' };
    }
  }

  /**
   * Admin-facing insights — high-level patterns across the cohort.
   */
  async adminInsights(): Promise<{ insights: string[]; source: 'openai' | 'gemini' | 'rule-based' }> {
    const [totalStudents, atRisk, rejected, pendingApprovals, recentPenalties30d] =
      await this.prisma.$transaction([
        this.prisma.student.count(),
        this.prisma.student.count({ where: { scholarshipStatus: 'AT_RISK' } }),
        this.prisma.student.count({ where: { scholarshipStatus: 'REJECTED' } }),
        this.prisma.achievement.count({ where: { status: 'PENDING' } }),
        this.prisma.penalty.count({
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

    const ruleBased = [
      `${totalStudents} students tracked overall.`,
      `${atRisk} students at risk of losing scholarship.`,
      rejected > 0 ? `${rejected} students currently rejected (GPA < 80% or final < 80).` : 'No students currently rejected.',
      pendingApprovals > 0 ? `${pendingApprovals} certificate approvals waiting in queue.` : 'Approval queue is empty.',
      `${recentPenalties30d} penalties issued in the last 30 days.`,
    ];

    if (this.provider === 'rule-based') {
      return { insights: ruleBased, source: 'rule-based' };
    }

    try {
      const llm = await this.adminLlmInsights({ totalStudents, atRisk, rejected, pendingApprovals, recentPenalties30d });
      return { insights: llm, source: this.provider };
    } catch (err) {
      this.logger.error('Admin AI call failed; using rule-based fallback', err as Error);
      return { insights: ruleBased, source: 'rule-based' };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private computeProbability(finalScore: number, gpa: number): number {
    if (gpa < 80) return 0;
    if (finalScore >= 90) return 95;
    if (finalScore >= 80) return Math.round(60 + (finalScore - 80) * 3);
    if (finalScore >= 70) return Math.round(30 + (finalScore - 70) * 2);
    return Math.max(5, Math.round(finalScore / 2));
  }

  private ruleBasedInsights(student: {
    gpa: number;
    attendancePercent: number;
    overallScore: number;
    penalties: Array<{ severity: string }>;
    achievements: Array<unknown>;
  }): string[] {
    const insights: string[] = [];
    if (student.gpa < 80) {
      insights.push(`Your GPA is ${student.gpa}% — you need at least 80% for scholarship eligibility.`);
    } else if (student.gpa >= 90) {
      insights.push(`Excellent GPA (${student.gpa}%). Stay focused to maintain scholarship.`);
    }
    if (student.attendancePercent < 75) {
      insights.push(`Attendance is at ${student.attendancePercent}% — bring it back above 75% to protect your final score.`);
    } else if (student.attendancePercent >= 95) {
      insights.push('Your attendance is excellent — that alone is worth ~19 KPI points.');
    }
    if (student.penalties.length > 0) {
      const major = student.penalties.filter((p) => p.severity === 'CRITICAL' || p.severity === 'MAJOR').length;
      if (major > 0) insights.push(`You have ${major} serious penalty/penalties — recovery tasks can restore up to half.`);
    }
    if (student.achievements.length === 0) {
      insights.push('No approved certificates yet — even one PDP certificate (+2-3) can move your rank.');
    }
    if (student.overallScore < 80) {
      const gap = 80 - student.overallScore;
      insights.push(`Final score is ${student.overallScore}. You need ${gap.toFixed(1)} more points to be eligible.`);
    }
    return insights.length ? insights : ['No specific advice — keep doing what you are doing.'];
  }

  private async llmInsights(
    student: {
      user: { fullName: string };
      gpa: number;
      attendancePercent: number;
      overallScore: number;
      achievements: Array<{ title: string; type: string }>;
      penalties: Array<{ type: string; severity: string }>;
    },
    finalScore: number,
    probability: number,
  ): Promise<string[]> {
    const prompt = `You are EduMetric, an empathetic university scholarship coach. Generate 3 short (max 1 sentence each), specific, actionable insights for this student. No fluff. Use "you" voice. Plain text only, one bullet per line, no markdown.

Student snapshot:
- Name: ${student.user.fullName}
- GPA: ${student.gpa}% (need ≥ 80% for scholarship eligibility)
- Attendance: ${student.attendancePercent}% (target ≥ 95%)
- Final KPI: ${finalScore}/110 (need ≥ 80 to be eligible)
- Scholarship probability: ${probability}%
- Approved achievements (${student.achievements.length}): ${student.achievements.map((a) => a.title).join('; ') || 'none'}
- Active penalties (${student.penalties.length}): ${student.penalties.map((p) => `${p.severity}/${p.type}`).join(', ') || 'none'}

Output exactly 3 lines.`;

    if (this.provider === 'openai' && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content ?? '';
      return text
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
    }
    if (this.provider === 'gemini' && this.geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return text
        .split('\n')
        .map((l) => l.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
    }
    return [];
  }

  private async adminLlmInsights(stats: {
    totalStudents: number;
    atRisk: number;
    rejected: number;
    pendingApprovals: number;
    recentPenalties30d: number;
  }): Promise<string[]> {
    const prompt = `You are EduMetric, an analytics assistant for university administrators. Given these cohort stats, return 3 short, actionable insights. Plain text only, one per line, no markdown.

Stats:
- Total students: ${stats.totalStudents}
- At risk: ${stats.atRisk}
- Rejected: ${stats.rejected}
- Pending approvals: ${stats.pendingApprovals}
- Penalties (last 30 days): ${stats.recentPenalties30d}`;

    if (this.provider === 'openai' && this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.6,
      });
      const text = completion.choices[0]?.message?.content ?? '';
      return text.split('\n').map((l) => l.replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean).slice(0, 5);
    }
    if (this.provider === 'gemini' && this.geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return text.split('\n').map((l) => l.replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean).slice(0, 5);
    }
    return [];
  }
}
