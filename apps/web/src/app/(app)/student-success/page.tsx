'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Filter, Plus, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '@edupulse/types';
import { RiskBadge } from '@/components/ui/risk-badge';
import { api } from '@/lib/api';

function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
}

function useRisks(filters: { riskLevel: string; classId: string; withoutIntervention: boolean; unengagedGuardian: boolean }) {
  return useQuery({
    queryKey: ['student-success', 'risks', filters],
    queryFn: () =>
      api
        .get('/student-success/risks', {
          params: {
            limit: 50,
            riskLevel: filters.riskLevel || undefined,
            classId: filters.classId || undefined,
            withoutIntervention: filters.withoutIntervention || undefined,
            unengagedGuardian: filters.unengagedGuardian || undefined,
          },
        })
        .then((r) => r.data),
  });
}

function reviewDate() {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString().slice(0, 10);
}

export default function StudentSuccessPage() {
  const queryClient = useQueryClient();
  const { data: classes } = useClasses();
  const [filters, setFilters] = useState<{
    riskLevel: RiskLevel | '';
    classId: string;
    withoutIntervention: boolean;
    unengagedGuardian: boolean;
  }>({
    riskLevel: RiskLevel.HIGH,
    classId: '',
    withoutIntervention: false,
    unengagedGuardian: false,
  });
  const { data, isLoading } = useRisks(filters);
  const [error, setError] = useState('');

  const createIntervention = useMutation({
    mutationFn: (student: any) =>
      api.post('/interventions', {
        studentId: student.id,
        riskScoreId: student.latestRisk?.id,
        reason: student.latestRisk?.factors?.[0]?.description ?? 'Aluno em acompanhamento preventivo',
        goal: student.suggestedActions?.[0] ?? 'Reduzir risco academico',
        reviewDate: reviewDate(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-success'] });
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel abrir a intervencao.'),
  });

  const totals = useMemo(() => {
    const rows = data?.data ?? [];
    return {
      high: rows.filter((student: any) => student.latestRisk?.level === RiskLevel.HIGH).length,
      medium: rows.filter((student: any) => student.latestRisk?.level === RiskLevel.MEDIUM).length,
      withoutIntervention: rows.filter((student: any) => !student.openIntervention).length,
    };
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-danger/10 p-2 text-danger">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Central de Alunos em Risco</h1>
          <p className="text-sm text-text-secondary">
            {data ? `${data.total} aluno${data.total !== 1 ? 's' : ''} encontrado${data.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-card p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Risco alto</p>
          <p className="text-2xl font-bold text-danger">{totals.high}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-card p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Risco medio</p>
          <p className="text-2xl font-bold text-warning">{totals.medium}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-text-secondary">Sem intervencao</p>
          <p className="text-2xl font-bold text-text-primary">{totals.withoutIntervention}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Filter size={16} /> Filtros
        </div>
        <div className="grid gap-3 lg:grid-cols-[180px_1fr_180px_220px]">
          <select
            value={filters.riskLevel}
            onChange={(event) => setFilters((current) => ({ ...current, riskLevel: event.target.value as RiskLevel | '' }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Todos os riscos</option>
            <option value={RiskLevel.HIGH}>Risco alto</option>
            <option value={RiskLevel.MEDIUM}>Risco medio</option>
            <option value={RiskLevel.LOW}>Risco baixo</option>
          </select>
          <select
            value={filters.classId}
            onChange={(event) => setFilters((current) => ({ ...current, classId: event.target.value }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Todas as turmas</option>
            {classes?.map((klass: any) => (
              <option key={klass.id} value={klass.id}>{klass.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={filters.withoutIntervention}
              onChange={(event) => setFilters((current) => ({ ...current, withoutIntervention: event.target.checked }))}
            />
            Sem intervencao
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={filters.unengagedGuardian}
              onChange={(event) => setFilters((current) => ({ ...current, unengagedGuardian: event.target.checked }))}
            />
            Responsavel sem leitura
          </label>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </section>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-5 py-3">Turma</th>
              <th className="px-5 py-3">Risco</th>
              <th className="px-5 py-3">Motivo principal</th>
              <th className="px-5 py-3">Intervencao</th>
              <th className="px-5 py-3">Acao sugerida</th>
              <th className="px-5 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-text-secondary">Carregando...</td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-success">Nenhum aluno encontrado para os filtros atuais.</td></tr>
            ) : (
              data?.data?.map((student: any) => {
                const risk = student.latestRisk;
                const enrollment = student.enrollments?.[0];
                const mainFactor = risk?.factors?.[0];
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/students/${student.id}`} className="font-medium text-primary hover:underline">
                        {student.name}
                      </Link>
                      <p className="text-xs text-text-secondary">{student.registrationId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{enrollment?.class?.name ?? '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {risk ? <RiskBadge level={risk.level as RiskLevel} /> : '-'}
                        <span className="font-bold text-text-primary">{risk?.score ?? '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary">{mainFactor?.description ?? '-'}</td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary">
                      {student.openIntervention ? student.openIntervention.status : 'Sem plano aberto'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary">{student.suggestedActions?.[0] ?? '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <Link href={`/students/${student.id}`} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                          Ver
                        </Link>
                        {!student.openIntervention && (
                          <button
                            onClick={() => createIntervention.mutate(student)}
                            disabled={createIntervention.isPending}
                            className="flex items-center gap-1 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/20 disabled:opacity-60"
                          >
                            <Plus size={13} /> Plano
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
