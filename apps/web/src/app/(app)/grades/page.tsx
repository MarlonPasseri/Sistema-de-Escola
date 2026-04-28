'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Plus, Save } from 'lucide-react';
import { api } from '@/lib/api';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
}

function useAcademicYears() {
  return useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/schools/academic-years').then((r) => r.data) });
}

function useAssessments() {
  return useQuery({ queryKey: ['assessments'], queryFn: () => api.get('/assessments', { params: { limit: 100 } }).then((r) => r.data.data) });
}

function useClassDetail(classId: string) {
  return useQuery({
    queryKey: ['classes', classId],
    queryFn: () => api.get(`/classes/${classId}`).then((r) => r.data),
    enabled: Boolean(classId),
  });
}

export default function GradesPage() {
  const queryClient = useQueryClient();
  const { data: classes } = useClasses();
  const { data: years } = useAcademicYears();
  const { data: assessments } = useAssessments();
  const [classId, setClassId] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const { data: classDetail } = useClassDetail(classId);

  const activeTerm = useMemo(() => {
    const activeYear = years?.find((year: any) => year.isActive) ?? years?.[0];
    return activeYear?.terms?.find((term: any) => term.isActive) ?? activeYear?.terms?.[0];
  }, [years]);

  const classSubjects = classDetail?.classSubjects ?? [];
  const students = classDetail?.enrollments?.map((item: any) => item.student) ?? [];
  const [assessmentForm, setAssessmentForm] = useState({
    subjectId: '',
    title: '',
    weight: '1',
    maxScore: '10',
    date: today(),
  });

  const createAssessment = useMutation({
    mutationFn: () => api.post('/assessments', {
      subjectId: assessmentForm.subjectId,
      academicTermId: activeTerm?.id,
      title: assessmentForm.title,
      weight: Number(assessmentForm.weight),
      maxScore: Number(assessmentForm.maxScore),
      date: assessmentForm.date || undefined,
    }),
    onSuccess: ({ data }) => {
      setAssessmentId(data.id);
      setAssessmentForm({ subjectId: '', title: '', weight: '1', maxScore: '10', date: today() });
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel criar a avaliacao.'),
  });

  const launchGrades = useMutation({
    mutationFn: () => api.post(`/assessments/${assessmentId}/grades`, {
      grades: students.map((student: any) => ({
        studentId: student.id,
        score: Number(gradeValues[student.id] || 0),
      })),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel salvar as notas.'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <ClipboardList size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notas e Avaliacoes</h1>
          <p className="text-sm text-text-secondary">Crie avaliacoes e lance notas em lote para recalcular risco.</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Contexto da turma</h2>
        <select
          value={classId}
          onChange={(event) => {
            setClassId(event.target.value);
            setAssessmentForm((current) => ({ ...current, subjectId: '' }));
            setGradeValues({});
          }}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Selecione uma turma</option>
          {classes?.map((klass: any) => (
            <option key={klass.id} value={klass.id}>{klass.name}</option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Nova avaliacao</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            createAssessment.mutate();
          }}
          className="grid gap-3 lg:grid-cols-[1fr_1.4fr_100px_100px_150px_140px]"
        >
          <select
            required
            value={assessmentForm.subjectId}
            onChange={(event) => setAssessmentForm((current) => ({ ...current, subjectId: event.target.value }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Disciplina</option>
            {classSubjects.map((item: any) => (
              <option key={item.subject.id} value={item.subject.id}>{item.subject.name}</option>
            ))}
          </select>
          <input required placeholder="Titulo" value={assessmentForm.title} onChange={(event) => setAssessmentForm((current) => ({ ...current, title: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="number" min="0.1" step="0.1" value={assessmentForm.weight} onChange={(event) => setAssessmentForm((current) => ({ ...current, weight: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="number" min="0" step="0.1" value={assessmentForm.maxScore} onChange={(event) => setAssessmentForm((current) => ({ ...current, maxScore: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input type="date" value={assessmentForm.date} onChange={(event) => setAssessmentForm((current) => ({ ...current, date: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <button disabled={!activeTerm || createAssessment.isPending} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Plus size={16} /> Criar
          </button>
        </form>
        {!activeTerm && <p className="mt-3 text-sm text-danger">Nenhum periodo letivo encontrado.</p>}
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid gap-3 border-b border-border px-5 py-4 lg:grid-cols-[1fr_160px]">
          <select
            value={assessmentId}
            onChange={(event) => setAssessmentId(event.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione uma avaliacao para lancar notas</option>
            {assessments?.map((assessment: any) => (
              <option key={assessment.id} value={assessment.id}>{assessment.title} - {assessment.subject.name}</option>
            ))}
          </select>
          <button
            disabled={!assessmentId || students.length === 0 || launchGrades.isPending}
            onClick={() => launchGrades.mutate()}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} /> Salvar notas
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-5 py-3">Matricula</th>
              <th className="px-5 py-3">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!classId ? (
              <tr><td colSpan={3} className="py-12 text-center text-text-secondary">Selecione uma turma para listar alunos.</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-text-secondary">Nenhum aluno matriculado nesta turma.</td></tr>
            ) : (
              students.map((student: any) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-text-primary">{student.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{student.registrationId}</td>
                  <td className="px-5 py-3.5">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={gradeValues[student.id] ?? ''}
                      onChange={(event) => setGradeValues((current) => ({ ...current, [student.id]: event.target.value }))}
                      className="w-28 rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
