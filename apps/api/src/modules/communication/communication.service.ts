import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RiskEngineService } from '../student-success/risk-engine.service';
import { StudentsService } from '../students/students.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { ListAnnouncementsDto } from './dto/list-announcements.dto';
import { AuthUser, AnnouncementAudience, UserRole } from '@edupulse/types';

@Injectable()
export class CommunicationService {
  constructor(
    private prisma: PrismaService,
    private riskEngine: RiskEngineService,
    private studentsService: StudentsService,
  ) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async create(actor: AuthUser, dto: CreateAnnouncementDto) {
    const { schoolId } = actor;

    const announcement = await this.prisma.announcement.create({
      data: {
        schoolId,
        authorId: actor.id,
        title: dto.title,
        content: dto.content,
        audience: dto.audience,
        classId: dto.classId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    const recipientData = await this.resolveRecipients(schoolId, dto);

    if (recipientData.length === 0) {
      throw new BadRequestException('Nenhum destinatário encontrado para a audiência selecionada');
    }

    await this.prisma.announcementRecipient.createMany({
      data: recipientData.map((r) => ({ ...r, announcementId: announcement.id })),
      skipDuplicates: true,
    });

    // Timeline events for direct student targets
    const studentIds = [...new Set(recipientData.map((r) => r.studentId).filter(Boolean))] as string[];
    await Promise.all(
      studentIds.map((sid) =>
        this.studentsService.addTimelineEvent(
          sid,
          'ANNOUNCEMENT_SENT',
          `Comunicado enviado: "${dto.title}"`,
          { announcementId: announcement.id },
        ),
      ),
    );

    return {
      ...announcement,
      recipientCount: recipientData.length,
    };
  }

  // ── List ──────────────────────────────────────────────────────────────────

  async list(actor: AuthUser, dto: ListAnnouncementsDto) {
    const { schoolId, id: userId, role } = actor;
    const { page = 1, limit = 20, audience, search } = dto;
    const skip = (page - 1) * limit;

    // GUARDIAN/STUDENT see only their own announcements via recipients
    if (role === UserRole.GUARDIAN || role === UserRole.STUDENT) {
      return this.listForRecipient(userId, dto);
    }

    const where: any = { schoolId };
    if (audience) where.audience = audience;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { recipients: true } },
        },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    // Attach read stats to each announcement
    const withStats = await Promise.all(
      announcements.map(async (a) => {
        const readCount = await this.prisma.announcementRecipient.count({
          where: { announcementId: a.id, readAt: { not: null } },
        });
        return { ...a, readCount, unreadCount: a._count.recipients - readCount };
      }),
    );

    return { data: withStats, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private async listForRecipient(userId: string, dto: ListAnnouncementsDto) {
    const { page = 1, limit = 20, unreadOnly } = dto;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) where.readAt = null;

    const [recipients, total] = await Promise.all([
      this.prisma.announcementRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { announcement: { createdAt: 'desc' } },
        include: {
          announcement: {
            include: { author: { select: { id: true, name: true } } },
          },
        },
      }),
      this.prisma.announcementRecipient.count({ where }),
    ]);

    return {
      data: recipients.map((r) => ({ ...r.announcement, readAt: r.readAt })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── Detail ────────────────────────────────────────────────────────────────

  async findById(schoolId: string, id: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, schoolId },
      include: {
        author: { select: { id: true, name: true } },
        recipients: {
          include: {
            student: { select: { id: true, name: true } },
          },
          orderBy: { announcement: { createdAt: 'desc' } },
        },
      },
    });
    if (!announcement) throw new NotFoundException('Comunicado não encontrado');
    return announcement;
  }

  // ── Read status ───────────────────────────────────────────────────────────

  async getReadStatus(schoolId: string, id: string) {
    const announcement = await this.prisma.announcement.findFirst({
      where: { id, schoolId },
    });
    if (!announcement) throw new NotFoundException('Comunicado não encontrado');

    const [read, unread] = await Promise.all([
      this.prisma.announcementRecipient.findMany({
        where: { announcementId: id, readAt: { not: null } },
        include: { student: { select: { id: true, name: true } } },
        orderBy: { readAt: 'asc' },
      }),
      this.prisma.announcementRecipient.findMany({
        where: { announcementId: id, readAt: null },
        include: { student: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      announcementId: id,
      title: announcement.title,
      total: read.length + unread.length,
      readCount: read.length,
      unreadCount: unread.length,
      readRate: read.length + unread.length > 0
        ? Math.round((read.length / (read.length + unread.length)) * 100)
        : 0,
      read,
      unread,
    };
  }

  // ── Mark as read ──────────────────────────────────────────────────────────

  async markAsRead(userId: string, announcementId: string) {
    const recipient = await this.prisma.announcementRecipient.findFirst({
      where: { announcementId, userId },
    });

    if (!recipient) throw new NotFoundException('Comunicado não encontrado para este usuário');
    if (recipient.readAt) return { alreadyRead: true, readAt: recipient.readAt };

    const updated = await this.prisma.announcementRecipient.update({
      where: { id: recipient.id },
      data: { readAt: new Date() },
    });

    // Recalculate risk for linked students — guardian engaging improves the score
    if (recipient.studentId) {
      await this.riskEngine.recalculateAndSave(recipient.studentId);
    }

    return { alreadyRead: false, readAt: updated.readAt };
  }

  // ── Unread count (for notification badge) ────────────────────────────────

  async getUnreadCount(userId: string) {
    const count = await this.prisma.announcementRecipient.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  // ── Resend to unread recipients ───────────────────────────────────────────

  async getUnengagedGuardians(schoolId: string) {
    const unread = await this.prisma.announcementRecipient.findMany({
      where: {
        readAt: null,
        announcement: { schoolId },
      },
      include: {
        student: { select: { id: true, name: true } },
      },
    });

    // Group by studentId
    const byStudent = new Map<string, { studentName: string; unreadCount: number }>();
    for (const r of unread) {
      if (!r.studentId) continue;
      const existing = byStudent.get(r.studentId);
      if (existing) {
        existing.unreadCount++;
      } else {
        byStudent.set(r.studentId, {
          studentName: r.student?.name ?? 'Desconhecido',
          unreadCount: 1,
        });
      }
    }

    return Array.from(byStudent.entries())
      .map(([studentId, data]) => ({ studentId, ...data }))
      .filter((s) => s.unreadCount >= 1)
      .sort((a, b) => b.unreadCount - a.unreadCount);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async resolveRecipients(
    schoolId: string,
    dto: CreateAnnouncementDto,
  ): Promise<Array<{ studentId?: string; userId?: string }>> {
    const recipients: Array<{ studentId?: string; userId?: string }> = [];

    switch (dto.audience) {
      case AnnouncementAudience.ALL: {
        const users = await this.prisma.user.findMany({
          where: { schoolId, isActive: true },
          select: { id: true },
        });
        const students = await this.prisma.student.findMany({
          where: { schoolId, isActive: true },
          select: { id: true },
        });
        users.forEach((u) => recipients.push({ userId: u.id }));
        students.forEach((s) => recipients.push({ studentId: s.id }));
        break;
      }

      case AnnouncementAudience.CLASS: {
        if (!dto.classId) throw new BadRequestException('classId é obrigatório para audiência CLASS');
        const enrollments = await this.prisma.enrollment.findMany({
          where: { classId: dto.classId, isActive: true },
          include: {
            student: {
              include: {
                guardians: {
                  include: { guardian: { include: { user: { select: { id: true } } } } },
                },
              },
            },
          },
        });
        for (const e of enrollments) {
          recipients.push({ studentId: e.studentId });
          for (const sg of e.student.guardians) {
            recipients.push({ userId: sg.guardian.user.id, studentId: e.studentId });
          }
        }
        break;
      }

      case AnnouncementAudience.STUDENT: {
        if (!dto.studentIds?.length) throw new BadRequestException('studentIds é obrigatório para audiência STUDENT');
        const students = await this.prisma.student.findMany({
          where: { id: { in: dto.studentIds }, schoolId },
          include: {
            guardians: {
              include: { guardian: { include: { user: { select: { id: true } } } } },
            },
          },
        });
        for (const s of students) {
          recipients.push({ studentId: s.id });
          for (const sg of s.guardians) {
            recipients.push({ userId: sg.guardian.user.id, studentId: s.id });
          }
        }
        break;
      }

      case AnnouncementAudience.GUARDIAN: {
        if (!dto.targetUserIds?.length) throw new BadRequestException('targetUserIds é obrigatório para audiência GUARDIAN');
        dto.targetUserIds.forEach((uid) => recipients.push({ userId: uid }));
        break;
      }

      case AnnouncementAudience.TEACHER: {
        const teachers = await this.prisma.user.findMany({
          where: { schoolId, role: 'TEACHER', isActive: true },
          select: { id: true },
        });
        teachers.forEach((u) => recipients.push({ userId: u.id }));
        break;
      }
    }

    return recipients;
  }
}
