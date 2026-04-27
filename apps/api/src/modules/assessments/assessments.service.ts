import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../student-success/risk-engine.service';
import { StudentsService } from '../students/students.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { LaunchGradesDto } from './dto/launch-grades.dto';
import { ListAssessmentsDto } from './dto/list-assessments.dto';

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private riskEngine: RiskEngineService,
    private studentsService: StudentsService,
  ) {}

  // ── Assessments ───────────────────────────────────────────────────────────

  async create(schoolId: string, dto: CreateAssessmentDto) {
    const [subject, term] = await Promise.all([
      this.prisma.subject.findFirst({ where: { id: dto.subjectId, schoolId } }),
      this.prisma.academicTerm.findUnique({ where: { id: dto.academicTermId } }),
    ]);
    if (!subject) throw new NotFoundException('Disciplina não encontrada');
    if (!term) throw new NotFoundException('Período letivo não encontrado');

    return this.prisma.assessment.create({
      data: {
        schoolId,
        subjectId: dto.subjectId,
        academicTermId: dto.academicTermId,
        title: dto.title,
        description: dto.description,
        weight: dto.weight ?? 1,
        maxScore: dto.maxScore ?? 10,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        subject: { select: { id: true, name: true } },
        academicTerm: { select: { id: true, name: true } },
        _count: { select: { grades: true } },
      },
    });
  }

  async list(schoolId: string, dto: ListAssessmentsDto) {
    const { page = 1, limit = 20, subjectId, academicTermId } = dto;
    const skip = (page - 1) * limit;

    const where: any = { schoolId };
    if (subjectId) where.subjectId = subjectId;
    if (academicTermId) where.academicTermId = academicTermId;

    const [assessments, total] = await Promise.all([
      this.prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          subject: { select: { id: true, name: true } },
          academicTerm: { select: { id: true, name: true } },
          _count: { select: { grades: true } },
        },
      }),
      this.prisma.assessment.count({ where }),
    ]);

    return { data: assessments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(schoolId: string, id: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { id, schoolId },
      include: {
        subject: { select: { id: true, name: true } },
        academicTerm: { select: { id: true, name: true } },
        grades: {
          include: { student: { select: { id: true, name: true, registrationId: true } } },
          orderBy: { student: { name: 'asc' } },
        },
      },
    });
    if (!assessment) throw new NotFoundException('Avaliação não encontrada');
    return assessment;
  }

  async update(schoolId: string, id: string, dto: UpdateAssessmentDto) {
    await this.findById(schoolId, id);
    return this.prisma.assessment.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
      include: {
        subject: { select: { id: true, name: true } },
        academicTerm: { select: { id: true, name: true } },
      },
    });
  }

  async remove(schoolId: string, id: string) {
    await this.findById(schoolId, id);
    await this.prisma.grade.deleteMany({ where: { assessmentId: id } });
    await this.prisma.assessment.delete({ where: { id } });
  }

  // ── Grades ────────────────────────────────────────────────────────────────

  async launchGrades(schoolId: string, assessmentId: string, dto: LaunchGradesDto) {
    const assessment = await this.findById(schoolId, assessmentId);

    const maxScore = Number(assessment.maxScore);
    for (const g of dto.grades) {
      if (g.score > maxScore) {
        throw new BadRequestException(
          `Nota ${g.score} de ${g.studentId} excede a nota máxima (${maxScore})`,
        );
      }
    }

    // Upsert all grades in a transaction
    await this.prisma.$transaction(
      dto.grades.map((g) =>
        this.prisma.grade.upsert({
          where: { studentId_assessmentId: { studentId: g.studentId, assessmentId } },
          create: { studentId: g.studentId, assessmentId, score: g.score, feedback: g.feedback },
          update: { score: g.score, feedback: g.feedback },
        }),
      ),
    );

    // Post-save: timeline + risk recalculation for each student
    await Promise.all(
      dto.grades.map(async (g) => {
        await this.studentsService.addTimelineEvent(
          g.studentId,
          'GRADE_RECORDED',
          `Nota ${g.score} registrada em "${assessment.title}" (${assessment.subject.name})`,
          { assessmentId, score: g.score, subject: assessment.subject.name },
        );
        await this.riskEngine.recalculateAndSave(g.studentId);
      }),
    );

    return this.findById(schoolId, assessmentId);
  }

  // ── Student report card ───────────────────────────────────────────────────

  async getReportCard(schoolId: string, studentId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      include: {
        assessment: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            academicTerm: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by subject → term → grades
    const map = new Map<
      string,
      {
        subject: { id: string; name: string; code: string | null };
        terms: Map<
          string,
          {
            term: { id: string; name: string };
            grades: { title: string; score: number; weight: number; maxScore: number; feedback: string | null }[];
            average: number;
          }
        >;
        overallAverage: number;
      }
    >();

    for (const grade of grades) {
      const { subject, academicTerm } = grade.assessment;
      const score = Number(grade.score);
      const weight = Number(grade.assessment.weight);
      const maxScore = Number(grade.assessment.maxScore);

      if (!map.has(subject.id)) {
        map.set(subject.id, { subject, terms: new Map(), overallAverage: 0 });
      }

      const subjectEntry = map.get(subject.id)!;

      if (!subjectEntry.terms.has(academicTerm.id)) {
        subjectEntry.terms.set(academicTerm.id, { term: academicTerm, grades: [], average: 0 });
      }

      subjectEntry.terms.get(academicTerm.id)!.grades.push({
        title: grade.assessment.title,
        score,
        weight,
        maxScore,
        feedback: grade.feedback,
      });
    }

    // Compute weighted averages
    for (const subjectEntry of map.values()) {
      let totalWeighted = 0;
      let totalWeight = 0;

      for (const termEntry of subjectEntry.terms.values()) {
        const { average, weighted, weight } = calcWeightedAverage(termEntry.grades);
        termEntry.average = average;
        totalWeighted += weighted;
        totalWeight += weight;
      }

      subjectEntry.overallAverage =
        totalWeight > 0 ? round(totalWeighted / totalWeight) : 0;
    }

    return Array.from(map.values()).map((s) => ({
      subject: s.subject,
      overallAverage: s.overallAverage,
      passing: s.overallAverage >= 5,
      terms: Array.from(s.terms.values()).map((t) => ({
        term: t.term,
        average: t.average,
        grades: t.grades,
      })),
    }));
  }

  // ── Class grades overview ─────────────────────────────────────────────────

  async getClassGrades(schoolId: string, assessmentId: string) {
    const assessment = await this.findById(schoolId, assessmentId);

    const stats = {
      count: assessment.grades.length,
      average: 0,
      highest: 0,
      lowest: Number(assessment.maxScore),
      passing: 0,
      failing: 0,
    };

    if (stats.count > 0) {
      const scores = assessment.grades.map((g) => Number(g.score));
      stats.average = round(scores.reduce((a, b) => a + b, 0) / scores.length);
      stats.highest = Math.max(...scores);
      stats.lowest = Math.min(...scores);
      stats.passing = scores.filter((s) => s >= 5).length;
      stats.failing = scores.filter((s) => s < 5).length;
    }

    return { assessment, stats };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcWeightedAverage(
  grades: { score: number; weight: number; maxScore: number }[],
): { average: number; weighted: number; weight: number } {
  let totalWeighted = 0;
  let totalWeight = 0;

  for (const g of grades) {
    // Normalize score to 0–10 scale before applying weight
    const normalized = g.maxScore > 0 ? (g.score / g.maxScore) * 10 : g.score;
    totalWeighted += normalized * g.weight;
    totalWeight += g.weight;
  }

  const average = totalWeight > 0 ? round(totalWeighted / totalWeight) : 0;
  return { average, weighted: totalWeighted, weight: totalWeight };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}
