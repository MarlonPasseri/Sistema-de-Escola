'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RiskBadge } from '@/components/ui/risk-badge';
import { RiskLevel } from '@edupulse/types';

function useStudents(page: number, search: string, riskLevel: string) {
  return useQuery({
    queryKey: ['students', page, search, riskLevel],
    queryFn: () =>
      api
        .get('/students', { params: { page, limit: 20, search: search || undefined, riskLevel: riskLevel || undefined } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');

  const { data, isLoading } = useStudents(page, search, riskLevel);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Alunos</h1>
          <p className="text-sm text-text-secondary">
            {data ? `${data.total} aluno${data.total !== 1 ? 's' : ''} encontrado${data.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Link
          href="/students/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus size={16} /> Novo Aluno
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome ou matrícula..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={riskLevel}
          onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Todos os riscos</option>
          <option value="HIGH">Risco Alto</option>
          <option value="MEDIUM">Risco Médio</option>
          <option value="LOW">Risco Baixo</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-5 py-3">Matrícula</th>
              <th className="px-5 py-3">Turma</th>
              <th className="px-5 py-3">Risco</th>
              <th className="px-5 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Carregando...
                  </div>
                </td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-text-secondary">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            ) : (
              data?.data?.map((student: any) => {
                const risk = student.riskScores?.[0];
                const enrollment = student.enrollments?.[0];
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/students/${student.id}`} className="font-medium text-primary hover:underline">
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{student.registrationId}</td>
                    <td className="px-5 py-3.5 text-text-secondary">
                      {enrollment?.class?.name ?? <span className="italic">Sem turma</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {risk ? <RiskBadge level={risk.level as RiskLevel} /> : <span className="text-text-secondary">—</span>}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-text-primary">
                      {risk?.score ?? '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-text-secondary">
            <span>Página {data.page} de {data.totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
