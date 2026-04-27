'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { RiskBadge } from '@/components/ui/risk-badge';
import { RiskLevel } from '@edupulse/types';
import { ShieldAlert } from 'lucide-react';

function useAtRiskStudents() {
  return useQuery({
    queryKey: ['students', 'risk', 'high'],
    queryFn: () =>
      api.get('/students', { params: { riskLevel: 'HIGH', limit: 50 } }).then((r) => r.data),
  });
}

export default function StudentSuccessPage() {
  const { data, isLoading } = useAtRiskStudents();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-danger/10 p-2 text-danger">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Central de Alunos em Risco</h1>
          <p className="text-sm text-text-secondary">
            {data ? `${data.total} aluno${data.total !== 1 ? 's' : ''} com risco alto` : ''}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-5 py-3">Turma</th>
              <th className="px-5 py-3">Risco</th>
              <th className="px-5 py-3">Score</th>
              <th className="px-5 py-3">Motivo Principal</th>
              <th className="px-5 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Carregando...
                  </div>
                </td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-success">
                  Nenhum aluno em risco alto no momento.
                </td>
              </tr>
            ) : (
              data?.data?.map((student: any) => {
                const risk = student.riskScores?.[0];
                const enrollment = student.enrollments?.[0];
                const mainFactor = risk?.factors?.[0];
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/students/${student.id}`} className="font-medium text-primary hover:underline">
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">
                      {enrollment?.class?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {risk ? <RiskBadge level={risk.level as RiskLevel} /> : '—'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-danger">{risk?.score ?? '—'}</td>
                    <td className="px-5 py-3.5 text-text-secondary text-xs">
                      {mainFactor?.description ?? '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/students/${student.id}`}
                        className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        Ver aluno
                      </Link>
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
