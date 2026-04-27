import { PrismaClient, UserRole, RiskLevel } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { slug: 'colegio-aurora' },
    update: {},
    create: {
      name: 'Colégio Aurora',
      slug: 'colegio-aurora',
      email: 'contato@aurora.edu.br',
      phone: '(11) 99999-0000',
      city: 'São Paulo',
      state: 'SP',
    },
  });

  const hash = await argon2.hash('senha123');

  // Users
  const adminUser = await prisma.user.upsert({
    where: { id: 'seed-admin' },
    update: {},
    create: {
      id: 'seed-admin',
      schoolId: school.id,
      email: 'admin@aurora.edu.br',
      passwordHash: hash,
      name: 'Admin EduPulse',
      role: UserRole.SCHOOL_ADMIN,
    },
  });

  const coordUser = await prisma.user.upsert({
    where: { id: 'seed-coordinator' },
    update: {},
    create: {
      id: 'seed-coordinator',
      schoolId: school.id,
      email: 'coord@aurora.edu.br',
      passwordHash: hash,
      name: 'Coordenadora Silva',
      role: UserRole.COORDINATOR,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { id: 'seed-teacher' },
    update: {},
    create: {
      id: 'seed-teacher',
      schoolId: school.id,
      email: 'professor@aurora.edu.br',
      passwordHash: hash,
      name: 'Carlos Andrade',
      role: UserRole.TEACHER,
    },
  });

  await prisma.teacher.upsert({
    where: { userId: 'seed-teacher' },
    update: {},
    create: {
      schoolId: school.id,
      userId: teacherUser.id,
      specialties: ['Matemática', 'Física'],
    },
  });

  // Academic year
  const year = await prisma.academicYear.upsert({
    where: { id: 'seed-year-2026' },
    update: {},
    create: {
      id: 'seed-year-2026',
      schoolId: school.id,
      name: '2026',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-12-15'),
      isActive: true,
    },
  });

  // Classes
  const class8A = await prisma.class.upsert({
    where: { id: 'seed-class-8a' },
    update: {},
    create: {
      id: 'seed-class-8a',
      schoolId: school.id,
      academicYearId: year.id,
      name: '8º Ano A',
      grade: '8',
      shift: 'Manhã',
    },
  });

  const class6B = await prisma.class.upsert({
    where: { id: 'seed-class-6b' },
    update: {},
    create: {
      id: 'seed-class-6b',
      schoolId: school.id,
      academicYearId: year.id,
      name: '6º Ano B',
      grade: '6',
      shift: 'Tarde',
    },
  });

  // Subjects
  const math = await prisma.subject.upsert({
    where: { id: 'seed-subject-math' },
    update: {},
    create: { id: 'seed-subject-math', schoolId: school.id, name: 'Matemática', code: 'MAT' },
  });

  const port = await prisma.subject.upsert({
    where: { id: 'seed-subject-port' },
    update: {},
    create: { id: 'seed-subject-port', schoolId: school.id, name: 'Português', code: 'POR' },
  });

  const sci = await prisma.subject.upsert({
    where: { id: 'seed-subject-sci' },
    update: {},
    create: { id: 'seed-subject-sci', schoolId: school.id, name: 'Ciências', code: 'CIE' },
  });

  // Class-Subject links
  const cs8Math = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class8A.id, subjectId: math.id } },
    update: {},
    create: { id: 'seed-cs-8a-math', classId: class8A.id, subjectId: math.id },
  });

  const cs8Port = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class8A.id, subjectId: port.id } },
    update: {},
    create: { id: 'seed-cs-8a-port', classId: class8A.id, subjectId: port.id },
  });

  const cs6Math = await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class6B.id, subjectId: math.id } },
    update: {},
    create: { id: 'seed-cs-6b-math', classId: class6B.id, subjectId: math.id },
  });

  // Teacher assignments
  const teacher = await prisma.teacher.findUnique({ where: { userId: 'seed-teacher' } });
  if (teacher) {
    for (const csId of [cs8Math.id, cs8Port.id, cs6Math.id]) {
      await prisma.teacherAssignment.upsert({
        where: { teacherId_classSubjectId: { teacherId: teacher.id, classSubjectId: csId } },
        update: {},
        create: { teacherId: teacher.id, classSubjectId: csId },
      });
    }
  }

  // Academic term
  const term = await prisma.academicTerm.upsert({
    where: { id: 'seed-term-1' },
    update: {},
    create: {
      id: 'seed-term-1',
      academicYearId: year.id,
      name: '1º Bimestre',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-30'),
      isActive: true,
    },
  });

  // Students
  const students = [
    { id: 'seed-student-1', registrationId: '2026001', name: 'João Silva', risk: RiskLevel.HIGH },
    { id: 'seed-student-2', registrationId: '2026002', name: 'Maria Souza', risk: RiskLevel.HIGH },
    { id: 'seed-student-3', registrationId: '2026003', name: 'Ana Costa', risk: RiskLevel.MEDIUM },
    { id: 'seed-student-4', registrationId: '2026004', name: 'Pedro Lima', risk: RiskLevel.LOW },
    { id: 'seed-student-5', registrationId: '2026005', name: 'Lucas Oliveira', risk: RiskLevel.MEDIUM },
  ];

  for (const s of students) {
    const student = await prisma.student.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        schoolId: school.id,
        registrationId: s.registrationId,
        name: s.name,
        birthDate: new Date('2012-05-10'),
      },
    });

    // Enroll in class
    const classId = ['seed-student-1', 'seed-student-2', 'seed-student-3'].includes(s.id)
      ? class8A.id
      : class6B.id;

    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId } },
      update: {},
      create: { studentId: student.id, classId },
    });

    // Risk score
    const scoreMap = { HIGH: 75, MEDIUM: 45, LOW: 15 };
    await prisma.riskScore.create({
      data: {
        studentId: student.id,
        score: scoreMap[s.risk],
        level: s.risk,
        factors: [
          s.risk === RiskLevel.HIGH
            ? { code: 'LOW_ATTENDANCE', description: 'Faltas recorrentes', points: 25 }
            : { code: 'GRADE_DROP', description: 'Queda de notas', points: 20 },
        ],
      },
    });

    // Timeline
    await prisma.studentTimeline.create({
      data: {
        studentId: student.id,
        type: 'ENROLLED',
        description: 'Aluno matriculado no sistema',
      },
    });

    if (s.risk === RiskLevel.HIGH) {
      await prisma.studentTimeline.create({
        data: {
          studentId: student.id,
          type: 'RISK_DETECTED',
          description: 'Score de risco elevado detectado',
          metadata: { score: scoreMap[s.risk], level: s.risk },
        },
      });
    }
  }

  // Attendance sessions — last 15 days for 8A Matemática
  const sessionDates = [-12, -10, -8, -5, -3, -1].map((d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  });

  for (const date of sessionDates) {
    const session = await prisma.attendanceSession.create({
      data: { classSubjectId: cs8Math.id, date, createdByUserId: adminUser.id },
    });

    // João and Maria absent on most sessions, others present
    const records = [
      { studentId: 'seed-student-1', status: 'ABSENT' as const },   // João — alto risco
      { studentId: 'seed-student-2', status: 'ABSENT' as const },   // Maria — alto risco
      { studentId: 'seed-student-3', status: 'PRESENT' as const },  // Ana
    ];

    for (const r of records) {
      await prisma.attendanceRecord.upsert({
        where: { sessionId_studentId: { sessionId: session.id, studentId: r.studentId } },
        update: {},
        create: { sessionId: session.id, studentId: r.studentId, status: r.status },
      });
    }
  }

  // Assessments & Grades
  // Prova 1 — todos os alunos do 8A (mostra queda e nota baixa)
  const prova1 = await prisma.assessment.create({
    data: {
      id: 'seed-assessment-math-p1',
      schoolId: school.id,
      subjectId: math.id,
      academicTermId: term.id,
      title: 'Prova 1 — Equações do 1º Grau',
      weight: 3,
      maxScore: 10,
      date: new Date('2026-03-10'),
    },
  });

  const prova2 = await prisma.assessment.create({
    data: {
      id: 'seed-assessment-math-p2',
      schoolId: school.id,
      subjectId: math.id,
      academicTermId: term.id,
      title: 'Prova 2 — Sistemas de Equações',
      weight: 3,
      maxScore: 10,
      date: new Date('2026-04-07'),
    },
  });

  const trabalho = await prisma.assessment.create({
    data: {
      id: 'seed-assessment-math-t1',
      schoolId: school.id,
      subjectId: math.id,
      academicTermId: term.id,
      title: 'Trabalho — Resolução de Problemas',
      weight: 2,
      maxScore: 10,
      date: new Date('2026-04-21'),
    },
  });

  const portProva1 = await prisma.assessment.create({
    data: {
      id: 'seed-assessment-port-p1',
      schoolId: school.id,
      subjectId: port.id,
      academicTermId: term.id,
      title: 'Prova 1 — Interpretação de Texto',
      weight: 3,
      maxScore: 10,
      date: new Date('2026-03-12'),
    },
  });

  // Grades — João e Maria com queda e notas baixas, Ana em recuperação, Pedro bem
  const gradeData = [
    // João Silva — queda: 8.0 → 4.5 (GRADE_DROP + LOW_GRADE)
    { assessmentId: prova1.id, studentId: 'seed-student-1', score: 8.0 },
    { assessmentId: prova2.id, studentId: 'seed-student-1', score: 4.5, feedback: 'Dificuldade em sistemas lineares. Recomenda-se revisão.' },
    { assessmentId: trabalho.id, studentId: 'seed-student-1', score: 4.0, feedback: 'Trabalho incompleto.' },
    { assessmentId: portProva1.id, studentId: 'seed-student-1', score: 7.0 },

    // Maria Souza — queda: 7.5 → 4.8 (GRADE_DROP + LOW_GRADE)
    { assessmentId: prova1.id, studentId: 'seed-student-2', score: 7.5 },
    { assessmentId: prova2.id, studentId: 'seed-student-2', score: 4.8, feedback: 'Precisa de reforço em álgebra.' },
    { assessmentId: trabalho.id, studentId: 'seed-student-2', score: 5.0 },
    { assessmentId: portProva1.id, studentId: 'seed-student-2', score: 6.5 },

    // Ana Costa — estável, boa aluna
    { assessmentId: prova1.id, studentId: 'seed-student-3', score: 8.5 },
    { assessmentId: prova2.id, studentId: 'seed-student-3', score: 8.0 },
    { assessmentId: trabalho.id, studentId: 'seed-student-3', score: 9.0 },
    { assessmentId: portProva1.id, studentId: 'seed-student-3', score: 9.5 },

    // Pedro Lima — excelente
    { assessmentId: prova1.id, studentId: 'seed-student-4', score: 9.5 },
    { assessmentId: prova2.id, studentId: 'seed-student-4', score: 9.0 },
    { assessmentId: portProva1.id, studentId: 'seed-student-4', score: 8.5 },

    // Lucas Oliveira — médio, leve queda
    { assessmentId: prova1.id, studentId: 'seed-student-5', score: 7.0 },
    { assessmentId: prova2.id, studentId: 'seed-student-5', score: 5.5 },
  ];

  for (const g of gradeData) {
    await prisma.grade.upsert({
      where: { studentId_assessmentId: { studentId: g.studentId, assessmentId: g.assessmentId } },
      update: {},
      create: g,
    });
  }

  console.log('  Avaliações: Prova 1, Prova 2, Trabalho (Matemática) + Prova 1 (Português)');
  console.log('  Notas lançadas:', gradeData.length);

  // Intervention plan for João Silva (seed-student-1)
  await prisma.interventionPlan.upsert({
    where: { id: 'seed-intervention-1' },
    update: {},
    create: {
      id: 'seed-intervention-1',
      schoolId: school.id,
      studentId: 'seed-student-1',
      ownerUserId: coordUser.id,
      status: 'IN_PROGRESS',
      reason: 'Queda de frequência e desempenho em Matemática',
      goal: 'Recuperar frequência acima de 85% e média acima de 6.0 em 30 dias',
      reviewDate: new Date('2026-05-27'),
    },
  });

  // Announcements — 4 comunicados, responsáveis de João e Maria não leram
  const announcements = [
    {
      id: 'seed-ann-1',
      title: 'Reunião de pais — 1º Bimestre',
      content: 'Informamos que a reunião de pais e responsáveis ocorrerá no dia 10/05/2026 às 19h no auditório.',
      audience: 'CLASS' as const,
    },
    {
      id: 'seed-ann-2',
      title: 'Calendário de provas — Abril/Maio',
      content: 'Segue o calendário de avaliações do 1º bimestre para acompanhamento dos responsáveis.',
      audience: 'CLASS' as const,
    },
    {
      id: 'seed-ann-3',
      title: 'Alerta de frequência — João Silva',
      content: 'O aluno João Silva apresentou queda de frequência nas últimas semanas. Solicitamos contato com a coordenação.',
      audience: 'STUDENT' as const,
    },
    {
      id: 'seed-ann-4',
      title: 'Resultado Prova 2 — Matemática',
      content: 'As notas da Prova 2 de Matemática estão disponíveis no sistema. Média da turma: 6.4.',
      audience: 'CLASS' as const,
    },
  ];

  for (const ann of announcements) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: {},
      create: {
        id: ann.id,
        schoolId: school.id,
        authorId: coordUser.id,
        title: ann.title,
        content: ann.content,
        audience: ann.audience,
        classId: ann.audience === 'CLASS' ? class8A.id : undefined,
      },
    });

    // Recipients: all 8A students linked to these announcements
    // Ana, Pedro read all; João and Maria never read (triggers GUARDIAN_NOT_READING)
    const targetStudents =
      ann.id === 'seed-ann-3'
        ? ['seed-student-1']
        : ['seed-student-1', 'seed-student-2', 'seed-student-3'];

    for (const sid of targetStudents) {
      const readAt = sid === 'seed-student-3' ? new Date() : null;
      await prisma.announcementRecipient.create({
        data: {
          announcementId: ann.id,
          studentId: sid,
          readAt,
        },
      });
    }
  }

  console.log('  Comunicados: 4 enviados (João e Maria com leitura pendente)');
  console.log('✓ Seed concluído');
  console.log('  Escola:', school.name);
  console.log('  Usuários: admin, coordenadora, professor');
  console.log('  Turmas: 8º Ano A, 6º Ano B');
  console.log('  Alunos:', students.map((s) => s.name).join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
