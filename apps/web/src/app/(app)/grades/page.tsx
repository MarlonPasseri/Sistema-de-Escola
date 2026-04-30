'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Plus, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

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

function useAssessmentDetail(assessmentId: string) {
  return useQuery({
    queryKey: ['assessments', assessmentId],
    queryFn: () => api.get(`/assessments/${assessmentId}`).then((r) => r.data),
    enabled: Boolean(assessmentId),
  });
}

export default function GradesPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data: classes } = useClasses();
  const { data: years } = useAcademicYears();
  const { data: assessments } = useAssessments();
  const [classId, setClassId] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { data: classDetail } = useClassDetail(classId);
  const { data: assessmentDetail } = useAssessmentDetail(assessmentId);

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
  const [assessmentEdit, setAssessmentEdit] = useState({ title: '', weight: '1', maxScore: '10', date: '' });

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
      setSuccess('Avaliação criada. Agora você pode lançar as notas.');
      toast.success('Avaliação criada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível criar a avaliação.'; setError(message); toast.error(message); },
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
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setError('');
      setSuccess('Notas salvas com sucesso.');
      toast.success('Notas salvas.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível salvar as notas.'; setError(message); toast.error(message); },
  });

  const updateAssessment = useMutation({
    mutationFn: () => api.patch(`/assessments/${assessmentId}`, {
      title: assessmentEdit.title,
      weight: Number(assessmentEdit.weight),
      maxScore: Number(assessmentEdit.maxScore),
      date: assessmentEdit.date || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
      setError('');
      setSuccess('Avaliação atualizada com sucesso.');
      toast.success('Avaliação atualizada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar a avaliação.'; setError(message); toast.error(message); },
  });

  const deleteAssessment = useMutation({
    mutationFn: () => api.delete(`/assessments/${assessmentId}`),
    onSuccess: () => {
      setAssessmentId('');
      setGradeValues({});
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      setError('');
      setSuccess('Avaliação removida.');
      toast.success('Avaliação removida.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível remover a avaliação.'; setError(message); toast.error(message); },
  });

  useEffect(() => {
    if (!assessmentDetail?.grades) return;

    const savedValues = Object.fromEntries(
      assessmentDetail.grades.map((grade: any) => [grade.studentId, String(Number(grade.score))]),
    );
    setGradeValues(savedValues);
    setAssessmentEdit({
      title: assessmentDetail.title ?? '',
      weight: String(Number(assessmentDetail.weight ?? 1)),
      maxScore: String(Number(assessmentDetail.maxScore ?? 10)),
      date: assessmentDetail.date ? String(assessmentDetail.date).slice(0, 10) : '',
    });
  }, [assessmentDetail]);

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
            setAssessmentId('');
            setAssessmentForm((current) => ({ ...current, subjectId: '' }));
            setGradeValues({});
            setSuccess('');
            setError('');
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
        <h2 className="mb-4 font-semibold text-text-primary">Nova avaliação</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setSuccess('');
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
        {!activeTerm && <p className="mt-3 text-sm text-danger">Nenhum período letivo encontrado.</p>}
        {success && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success">
            <CheckCircle2 size={16} /> {success}
          </p>
        )}
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid gap-3 border-b border-border px-5 py-4 lg:grid-cols-[1fr_160px]">
          <select
            value={assessmentId}
            onChange={(event) => {
              setAssessmentId(event.target.value);
              setGradeValues({});
              setSuccess('');
              setError('');
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione uma avaliação para lançar notas</option>
            {assessments?.map((assessment: any) => (
              <option key={assessment.id} value={assessment.id}>{assessment.title} - {assessment.subject.name}</option>
            ))}
          </select>
          <button
            disabled={!assessmentId || students.length === 0 || launchGrades.isPending}
            onClick={() => {
              setError('');
              setSuccess('');
              launchGrades.mutate();
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} /> Salvar notas
          </button>
        </div>
        {success && (
          <div className="border-b border-border bg-green-50 px-5 py-3 text-sm font-medium text-success">
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} /> {success}</span>
          </div>
        )}
        {error && (
          <div className="border-b border-border bg-red-50 px-5 py-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        {assessmentId && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              setSuccess('');
              updateAssessment.mutate();
            }}
            className="grid gap-3 border-b border-border px-5 py-4 lg:grid-cols-[1fr_100px_100px_150px_120px_120px]"
          >
            <input required value={assessmentEdit.title} onChange={(event) => setAssessmentEdit((current) => ({ ...current, title: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input required type="number" min="0.1" step="0.1" value={assessmentEdit.weight} onChange={(event) => setAssessmentEdit((current) => ({ ...current, weight: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input required type="number" min="0" step="0.1" value={assessmentEdit.maxScore} onChange={(event) => setAssessmentEdit((current) => ({ ...current, maxScore: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input type="date" value={assessmentEdit.date} onChange={(event) => setAssessmentEdit((current) => ({ ...current, date: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <button disabled={updateAssessment.isPending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Atualizar</button>
            <button type="button" disabled={deleteAssessment.isPending} onClick={async () => { if (await confirm({ title: 'Remover avaliação?', description: 'As notas vinculadas a esta avaliação também serão removidas.', confirmLabel: 'Remover', destructive: true })) deleteAssessment.mutate(); }} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60">Remover</button>
          </form>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-5 py-3">Matrícula</th>
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
