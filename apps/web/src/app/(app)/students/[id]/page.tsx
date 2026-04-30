'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, CalendarCheck, GraduationCap, Mail, Plus, ShieldAlert, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { RiskLevel } from '@edupulse/types';
import { RiskBadge } from '@/components/ui/risk-badge';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => api.get(`/students/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function useTimeline(id: string) {
  return useQuery({
    queryKey: ['students', id, 'timeline'],
    queryFn: () => api.get(`/students/${id}/timeline`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function useAttendance(id: string) {
  return useQuery({
    queryKey: ['students', id, 'attendance'],
    queryFn: () => api.get(`/attendance/student/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function useReportCard(id: string) {
  return useQuery({
    queryKey: ['students', id, 'report-card'],
    queryFn: () => api.get(`/grades/student/${id}/report-card`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function useOccurrences(id: string) {
  return useQuery({
    queryKey: ['students', id, 'occurrences'],
    queryFn: () => api.get('/occurrences', { params: { studentId: id, limit: 20 } }).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then((r) => r.data),
  });
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const id = params.id;
  const queryClient = useQueryClient();
  const { data: student, isLoading } = useStudent(id);
  const { data: timeline } = useTimeline(id);
  const { data: attendance } = useAttendance(id);
  const { data: reportCard } = useReportCard(id);
  const { data: occurrences } = useOccurrences(id);
  const { data: classes } = useClasses();
  const currentClass = student?.enrollments?.[0]?.class;
  const [guardian, setGuardian] = useState({ name: '', phone: '', email: '', relationship: 'Responsável' });
  const [occurrence, setOccurrence] = useState({ type: 'DISCIPLINARY', description: '' });
  const [editingOccurrenceId, setEditingOccurrenceId] = useState('');
  const [occurrenceEdit, setOccurrenceEdit] = useState({ type: '', description: '' });
  const [classId, setClassId] = useState('');
  const [studentForm, setStudentForm] = useState({ name: '', registrationId: '', birthDate: '', gender: '', address: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!student) return;
    setStudentForm({
      name: student.name ?? '',
      registrationId: student.registrationId ?? '',
      birthDate: student.birthDate ? String(student.birthDate).slice(0, 10) : '',
      gender: student.gender ?? '',
      address: student.address ?? '',
      notes: student.notes ?? '',
    });
  }, [student]);

  const updateStudent = useMutation({
    mutationFn: () => api.patch(`/students/${id}`, Object.fromEntries(
      Object.entries(studentForm).filter(([, value]) => value !== ''),
    )),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setError('');
      toast.success('Aluno atualizado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar o aluno.'; setError(message); toast.error(message); },
  });

  const deactivateStudent = useMutation({
    mutationFn: () => api.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Aluno desativado.');
      router.push('/students');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível desativar o aluno.'; setError(message); toast.error(message); },
  });

  const addGuardian = useMutation({
    mutationFn: () => api.post(`/students/${id}/guardians`, guardian),
    onSuccess: () => {
      setGuardian({ name: '', phone: '', email: '', relationship: 'Responsável' });
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      toast.success('Responsável vinculado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível vincular o responsável.'; setError(message); toast.error(message); },
  });

  const addOccurrence = useMutation({
    mutationFn: () => api.post('/occurrences', { studentId: id, ...occurrence }),
    onSuccess: () => {
      setOccurrence({ type: 'DISCIPLINARY', description: '' });
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'occurrences'] });
      toast.success('Ocorrência registrada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível registrar a ocorrência.'; setError(message); toast.error(message); },
  });

  const updateOccurrence = useMutation({
    mutationFn: () => api.patch(`/occurrences/${editingOccurrenceId}`, occurrenceEdit),
    onSuccess: () => {
      setEditingOccurrenceId('');
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'occurrences'] });
      setError('');
      toast.success('Ocorrência atualizada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar a ocorrência.'; setError(message); toast.error(message); },
  });

  const resolveOccurrence = useMutation({
    mutationFn: (occurrenceId: string) => api.patch(`/occurrences/${occurrenceId}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'occurrences'] });
      setError('');
      toast.success('Ocorrência resolvida.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível resolver a ocorrência.'; setError(message); toast.error(message); },
  });

  const updateEnrollment = useMutation({
    mutationFn: async () => {
      const selectedClassId = classId || currentClass?.id;
      if (!selectedClassId) return;
      if (currentClass?.id && currentClass.id !== selectedClassId) {
        await api.delete(`/classes/${currentClass.id}/enrollments/${id}`);
      }
      if (currentClass?.id !== selectedClassId) {
        await api.post(`/classes/${selectedClassId}/enrollments/${id}`, {});
      }
    },
    onSuccess: () => {
      setClassId('');
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma atualizada para o aluno.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível vincular o aluno à turma.'; setError(message); toast.error(message); },
  });

  const removeEnrollment = useMutation({
    mutationFn: async () => {
      if (!currentClass?.id) return Promise.resolve();
      await api.delete(`/classes/${currentClass.id}/enrollments/${id}`);
    },
    onSuccess: () => {
      setClassId('');
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Aluno removido da turma.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível remover o aluno da turma.'; setError(message); toast.error(message); },
  });

  if (isLoading) {
    return <div className="py-12 text-center text-text-secondary">Carregando aluno...</div>;
  }

  if (!student) {
    return <div className="py-12 text-center text-text-secondary">Aluno não encontrado.</div>;
  }

  const risk = student.riskScores?.[0];
  const overallAverage = reportCard?.length
    ? Math.round((reportCard.reduce((sum: number, item: any) => sum + item.overallAverage, 0) / reportCard.length) * 10) / 10
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/students" className="rounded-lg border border-border p-2 text-text-secondary hover:bg-slate-50">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-text-primary">{student.name}</h1>
          <p className="text-sm text-text-secondary">
            {currentClass?.name ?? 'Sem turma'} - Matrícula {student.registrationId}
          </p>
        </div>
        {risk && <RiskBadge level={risk.level as RiskLevel} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><ShieldAlert size={17} /> Risco atual</div>
          <p className="text-3xl font-bold text-text-primary">{risk?.score ?? '-'}</p>
          <p className="text-xs text-text-secondary">{risk?.factors?.[0]?.description ?? 'Sem fator registrado'}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><CalendarCheck size={17} /> Frequência</div>
          <p className="text-3xl font-bold text-text-primary">{attendance?.rate ?? 100}%</p>
          <p className="text-xs text-text-secondary">{attendance?.absent ?? 0} faltas registradas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><UserRound size={17} /> Média geral</div>
          <p className="text-3xl font-bold text-text-primary">{overallAverage ?? '-'}</p>
          <p className="text-xs text-text-secondary">Calculada por boletim</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><Mail size={17} /> Responsáveis</div>
          <p className="text-3xl font-bold text-text-primary">{student.guardians?.length ?? 0}</p>
          <p className="text-xs text-text-secondary">Vínculos familiares</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Dados do aluno</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            updateStudent.mutate();
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <input required placeholder="Nome" value={studentForm.name} onChange={(event) => setStudentForm((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required placeholder="Matrícula" value={studentForm.registrationId} onChange={(event) => setStudentForm((current) => ({ ...current, registrationId: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input type="date" value={studentForm.birthDate} onChange={(event) => setStudentForm((current) => ({ ...current, birthDate: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <select value={studentForm.gender} onChange={(event) => setStudentForm((current) => ({ ...current, gender: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="">Gênero não informado</option>
            <option value="F">Feminino</option>
            <option value="M">Masculino</option>
            <option value="OTHER">Outro</option>
          </select>
          <input placeholder="Endereço" value={studentForm.address} onChange={(event) => setStudentForm((current) => ({ ...current, address: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary md:col-span-2" />
          <textarea rows={3} placeholder="Observações" value={studentForm.notes} onChange={(event) => setStudentForm((current) => ({ ...current, notes: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary md:col-span-2" />
          <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:justify-end">
            <button disabled={updateStudent.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              Salvar alterações
            </button>
            <button
              type="button"
              disabled={deactivateStudent.isPending}
              onClick={async () => {
                if (await confirm({ title: 'Desativar aluno?', description: 'O aluno não aparecerá mais nas listas ativas.', confirmLabel: 'Desativar', destructive: true })) deactivateStudent.mutate();
              }}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
            >
              Desativar aluno
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Boletim</h2>
          <div className="space-y-3">
            {reportCard?.length ? reportCard.map((item: any) => (
              <div key={item.subject.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="font-medium text-text-primary">{item.subject.name}</p>
                  <p className="text-xs text-text-secondary">{item.terms?.length ?? 0} período(s)</p>
                </div>
                <span className={item.passing ? 'font-bold text-success' : 'font-bold text-danger'}>{item.overallAverage}</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-text-secondary">Sem notas lançadas.</p>}
          </div>
        </section>

        <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <h2 className="font-semibold text-text-primary">Turma do aluno</h2>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              updateEnrollment.mutate();
            }}
            className="space-y-3"
          >
            <select
              value={classId || currentClass?.id || ''}
              onChange={(event) => setClassId(event.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Selecione uma turma</option>
              {classes?.map((klass: any) => (
                <option key={klass.id} value={klass.id}>
                  {klass.name} - {klass.grade}
                </option>
              ))}
            </select>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                disabled={updateEnrollment.isPending || !classes?.length || (classId || currentClass?.id || '') === (currentClass?.id || '')}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Plus size={16} /> Vincular turma
              </button>
              {currentClass && (
                <button
                  type="button"
                  disabled={removeEnrollment.isPending}
                  onClick={() => {
                    setError('');
                    removeEnrollment.mutate();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-slate-50 disabled:opacity-60"
                >
                  <X size={16} /> Remover da turma
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Adicionar responsável</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              addGuardian.mutate();
            }}
            className="space-y-3"
          >
            <input required placeholder="Nome" value={guardian.name} onChange={(e) => setGuardian((g) => ({ ...g, name: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input required placeholder="Telefone" value={guardian.phone} onChange={(e) => setGuardian((g) => ({ ...g, phone: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input type="email" placeholder="E-mail" value={guardian.email} onChange={(e) => setGuardian((g) => ({ ...g, email: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input required placeholder="Parentesco" value={guardian.relationship} onChange={(e) => setGuardian((g) => ({ ...g, relationship: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
            <button disabled={addGuardian.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Plus size={16} /> Vincular responsável
            </button>
          </form>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            <h2 className="font-semibold text-text-primary">Ocorrências</h2>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              addOccurrence.mutate();
            }}
            className="space-y-3"
          >
            <select
              value={occurrence.type}
              onChange={(event) => setOccurrence((current) => ({ ...current, type: event.target.value }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="DISCIPLINARY">Disciplinar</option>
              <option value="PARTICIPATION">Participação</option>
              <option value="ACADEMIC">Acadêmica</option>
              <option value="OTHER">Outra</option>
            </select>
            <textarea
              required
              rows={3}
              placeholder="Descrição da ocorrência"
              value={occurrence.description}
              onChange={(event) => setOccurrence((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button disabled={addOccurrence.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-warning px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Plus size={16} /> Registrar ocorrência
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {occurrences?.data?.length ? occurrences.data.map((item: any) => (
              <div key={item.id} className="rounded-lg border border-border px-3 py-2">
                {editingOccurrenceId === item.id ? (
                  <div className="space-y-2">
                    <select value={occurrenceEdit.type} onChange={(event) => setOccurrenceEdit((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary">
                      <option value="DISCIPLINARY">Disciplinar</option>
                      <option value="PARTICIPATION">Participação</option>
                      <option value="ACADEMIC">Acadêmica</option>
                      <option value="OTHER">Outra</option>
                    </select>
                    <textarea value={occurrenceEdit.description} onChange={(event) => setOccurrenceEdit((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary" />
                    <div className="flex gap-2">
                      <button onClick={() => updateOccurrence.mutate()} className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">Salvar</button>
                      <button onClick={() => setEditingOccurrenceId('')} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-primary">{item.description}</p>
                    <p className="text-xs text-text-secondary">{item.type} - {new Date(item.date).toLocaleDateString('pt-BR')} {item.resolved ? '- Resolvida' : ''}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => { setEditingOccurrenceId(item.id); setOccurrenceEdit({ type: item.type, description: item.description }); }} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-slate-50">Editar</button>
                      {!item.resolved && <button onClick={() => resolveOccurrence.mutate(item.id)} className="rounded border border-green-200 px-2 py-1 text-xs font-semibold text-success hover:bg-green-50">Resolver</button>}
                    </div>
                  </>
                )}
              </div>
            )) : <p className="text-sm text-text-secondary">Nenhuma ocorrência registrada.</p>}
          </div>
        </section>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Timeline</h2>
        <div className="space-y-3">
          {timeline?.length ? timeline.map((event: any) => (
            <div key={event.id} className="border-l-2 border-primary/30 pl-3">
              <p className="text-sm font-medium text-text-primary">{event.description}</p>
              <p className="text-xs text-text-secondary">{new Date(event.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          )) : <p className="py-6 text-center text-sm text-text-secondary">Nenhum evento registrado.</p>}
        </div>
      </section>
    </div>
  );
}
