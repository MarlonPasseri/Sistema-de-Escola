import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskLevel } from '@edupulse/types';

interface RiskFactor {
  code: string;
  description: string;
  points: number;
}

interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

@Injectable()
export class RiskEngineService {
  constructor(private prisma: PrismaService) {}

  async calculate(studentId: string): Promise<RiskResult> {
    const factors: RiskFactor[] = [];
    let score = 0;

    const now = new Date();
    const days7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const days15ago = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const days30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── Rule 1: Absence in last 7 days ─────────────────────────────────────
    const recentAbsences = await this.prisma.attendanceRecord.count({
      where: {
        studentId,
        status: { in: ['ABSENT'] },
        session: { date: { gte: days7ago } },
      },
    });

    if (recentAbsences >= 1) {
      const pts = recentAbsences * 10;
      score += pts;
      factors.push({
        code: 'RECENT_ABSENCE',
        description: `${recentAbsences} falta${recentAbsences > 1 ? 's' : ''} nos últimos 7 dias`,
        points: pts,
      });
    }

    // ── Rule 2: 3+ absences in last 15 days ────────────────────────────────
    const absences15 = await this.prisma.attendanceRecord.count({
      where: {
        studentId,
        status: 'ABSENT',
        session: { date: { gte: days15ago } },
      },
    });

    if (absences15 >= 3) {
      score += 25;
      factors.push({
        code: 'LOW_ATTENDANCE_15_DAYS',
        description: `${absences15} faltas nos últimos 15 dias`,
        points: 25,
      });
    }

    // ── Rule 3: Grade below 5 ───────────────────────────────────────────────
    const lowGrades = await this.prisma.grade.findMany({
      where: { studentId, score: { lt: 5 } },
      include: { assessment: { include: { subject: { select: { name: true } } } } },
    });

    if (lowGrades.length > 0) {
      const pts = Math.min(lowGrades.length * 25, 50);
      score += pts;
      const subjects = [...new Set(lowGrades.map((g) => g.assessment.subject.name))].join(', ');
      factors.push({
        code: 'LOW_GRADE',
        description: `Nota abaixo de 5 em: ${subjects}`,
        points: pts,
      });
    }

    // ── Rule 4: Grade drop >= 20% ───────────────────────────────────────────
    const gradeDrop = await this.detectGradeDrop(studentId);
    if (gradeDrop) {
      score += 20;
      factors.push({
        code: 'GRADE_DROP',
        description: `Queda de ${gradeDrop.dropPct}% em ${gradeDrop.subject}`,
        points: 20,
      });
    }

    // ── Rule 5: Guardian not reading announcements (3+) ────────────────────
    const unreadCount = await this.countUnreadGuardianAnnouncements(studentId);
    if (unreadCount >= 3) {
      score += 10;
      factors.push({
        code: 'GUARDIAN_NOT_READING',
        description: `Responsável não abriu ${unreadCount} comunicados`,
        points: 10,
      });
    }

    // ── Rule 6: Disciplinary occurrence in last 30 days ────────────────────
    const occurrences = await this.prisma.occurrence.count({
      where: { studentId, date: { gte: days30ago }, resolved: false },
    });

    if (occurrences > 0) {
      const pts = occurrences * 15;
      score += pts;
      factors.push({
        code: 'DISCIPLINARY_OCCURRENCE',
        description: `${occurrences} ocorrência${occurrences > 1 ? 's' : ''} disciplinar${occurrences > 1 ? 'es' : ''} recente${occurrences > 1 ? 's' : ''}`,
        points: pts,
      });
    }

    const cappedScore = Math.min(score, 100);
    const level = this.scoreToLevel(cappedScore);

    return { score: cappedScore, level, factors };
  }

  async recalculateAndSave(studentId: string): Promise<void> {
    const result = await this.calculate(studentId);

    const previous = await this.prisma.riskScore.findFirst({
      where: { studentId },
      orderBy: { calculatedAt: 'desc' },
    });

    await this.prisma.riskScore.create({
      data: {
        studentId,
        score: result.score,
        level: result.level,
        factors: result.factors as any,
      },
    });

    // Add timeline event only when risk level changes
    if (!previous || previous.level !== result.level) {
      const levelChanged = previous
        ? `Risco alterado de ${previous.level} para ${result.level}`
        : `Score de risco inicial: ${result.level}`;

      await this.prisma.studentTimeline.create({
        data: {
          studentId,
          type: 'RISK_UPDATED',
          description: levelChanged,
          metadata: { score: result.score, level: result.level, factors: result.factors } as any,
        },
      });
    }
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 61) return RiskLevel.HIGH;
    if (score >= 31) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private async detectGradeDrop(
    studentId: string,
  ): Promise<{ subject: string; dropPct: number } | null> {
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      include: {
        assessment: {
          include: { subject: { select: { id: true, name: true } }, academicTerm: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by subject
    const bySubject: Record<string, number[]> = {};
    for (const g of grades) {
      const key = g.assessment.subject.id;
      if (!bySubject[key]) bySubject[key] = [];
      bySubject[key].push(Number(g.score));
    }

    for (const [subjectId, scores] of Object.entries(bySubject)) {
      if (scores.length < 2) continue;
      const mid = Math.floor(scores.length / 2);
      const avgFirst = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const avgLast = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);
      const drop = avgFirst > 0 ? ((avgFirst - avgLast) / avgFirst) * 100 : 0;
      if (drop >= 20) {
        const subjectName = grades.find(
          (g) => g.assessment.subject.id === subjectId,
        )?.assessment.subject.name;
        return { subject: subjectName ?? subjectId, dropPct: Math.round(drop) };
      }
    }

    return null;
  }

  private async countUnreadGuardianAnnouncements(studentId: string): Promise<number> {
    return this.prisma.announcementRecipient.count({
      where: { studentId, readAt: null },
    });
  }
}
