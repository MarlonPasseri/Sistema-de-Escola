'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, CalendarCheck, Mail, Plus, ShieldAlert, UserRound } from 'lucide-react';
import Link from 'next/link';
import { RiskLevel } from '@edupulse/types';
import { RiskBadge } from '@/components/ui/risk-badge';
import { api } from '@/lib/api';

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

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const { data: student, isLoading } = useStudent(id);
  const { data: timeline } = useTimeline(id);
  const { data: attendance } = useAttendance(id);
  const { data: reportCard } = useReportCard(id);
  const { data: occurrences } = useOccurrences(id);
  const [guardian, setGuardian] = useState({ name: '', phone: '', email: '', relationship: 'Responsavel' });
  const [occurrence, setOccurrence] = useState({ type: 'DISCIPLINARY', description: '' });
  const [error, setError] = useState('');

  const addGuardian = useMutation({
    mutationFn: () => api.post(`/students/${id}/guardians`, guardian),
    onSuccess: () => {
      setGuardian({ name: '', phone: '', email: '', relationship: 'Responsavel' });
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel vincular o responsavel.'),
  });

  const addOccurrence = useMutation({
    mutationFn: () => api.post('/occurrences', { studentId: id, ...occurrence }),
    onSuccess: () => {
      setOccurrence({ type: 'DISCIPLINARY', description: '' });
      queryClient.invalidateQueries({ queryKey: ['students', id] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'timeline'] });
      queryClient.invalidateQueries({ queryKey: ['students', id, 'occurrences'] });
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel registrar a ocorrencia.'),
  });

  if (isLoading) {
    return <div className="py-12 text-center text-text-secondary">Carregando aluno...</div>;
  }

  if (!student) {
    return <div className="py-12 text-center text-text-secondary">Aluno nao encontrado.</div>;
  }

  const risk = student.riskScores?.[0];
  const currentClass = student.enrollments?.[0]?.class;
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
            {currentClass?.name ?? 'Sem turma'} - Matricula {student.registrationId}
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
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><CalendarCheck size={17} /> Frequencia</div>
          <p className="text-3xl font-bold text-text-primary">{attendance?.rate ?? 100}%</p>
          <p className="text-xs text-text-secondary">{attendance?.absent ?? 0} faltas registradas</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><UserRound size={17} /> Media geral</div>
          <p className="text-3xl font-bold text-text-primary">{overallAverage ?? '-'}</p>
          <p className="text-xs text-text-secondary">Calculada por boletim</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-text-secondary"><Mail size={17} /> Responsaveis</div>
          <p className="text-3xl font-bold text-text-primary">{student.guardians?.length ?? 0}</p>
          <p className="text-xs text-text-secondary">Vinculos familiares</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Boletim</h2>
          <div className="space-y-3">
            {reportCard?.length ? reportCard.map((item: any) => (
              <div key={item.subject.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="font-medium text-text-primary">{item.subject.name}</p>
                  <p className="text-xs text-text-secondary">{item.terms?.length ?? 0} periodo(s)</p>
                </div>
                <span className={item.passing ? 'font-bold text-success' : 'font-bold text-danger'}>{item.overallAverage}</span>
              </div>
            )) : <p className="py-6 text-center text-sm text-text-secondary">Sem notas lancadas.</p>}
          </div>
        </section>

        <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Adicionar responsavel</h2>
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
              <Plus size={16} /> Vincular responsavel
            </button>
          </form>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" />
            <h2 className="font-semibold text-text-primary">Ocorrencias</h2>
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
              <option value="PARTICIPATION">Participacao</option>
              <option value="ACADEMIC">Academica</option>
              <option value="OTHER">Outra</option>
            </select>
            <textarea
              required
              rows={3}
              placeholder="Descricao da ocorrencia"
              value={occurrence.description}
              onChange={(event) => setOccurrence((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button disabled={addOccurrence.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-warning px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Plus size={16} /> Registrar ocorrencia
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {occurrences?.data?.length ? occurrences.data.map((item: any) => (
              <div key={item.id} className="rounded-lg border border-border px-3 py-2">
                <p className="text-sm font-medium text-text-primary">{item.description}</p>
                <p className="text-xs text-text-secondary">{item.type} - {new Date(item.date).toLocaleDateString('pt-BR')}</p>
              </div>
            )) : <p className="text-sm text-text-secondary">Nenhuma ocorrencia registrada.</p>}
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
