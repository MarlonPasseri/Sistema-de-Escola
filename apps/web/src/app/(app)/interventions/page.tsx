'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AlertTriangle, MessageSquarePlus, Save } from 'lucide-react';
import { InterventionStatus } from '@edupulse/types';
import { api } from '@/lib/api';

function useInterventions(status: string) {
  return useQuery({
    queryKey: ['interventions', status],
    queryFn: () =>
      api.get('/interventions', { params: { limit: 50, status: status || undefined } }).then((r) => r.data),
  });
}

function useIntervention(id: string) {
  return useQuery({
    queryKey: ['interventions', id],
    queryFn: () => api.get(`/interventions/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export default function InterventionsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const { data, isLoading } = useInterventions(status);
  const { data: selected } = useIntervention(selectedId);

  const updateStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: InterventionStatus }) =>
      api.patch(`/interventions/${id}`, { status: nextStatus }),
    onSuccess: ({ data }) => {
      setSelectedId(data.id);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel atualizar o plano.'),
  });

  const addNote = useMutation({
    mutationFn: () => api.post(`/interventions/${selectedId}/notes`, { content: note }),
    onSuccess: () => {
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      queryClient.invalidateQueries({ queryKey: ['interventions', selectedId] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel adicionar a nota.'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-warning/10 p-2 text-warning">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Planos de Intervencao</h1>
          <p className="text-sm text-text-secondary">Acompanhe a execucao das acoes abertas pela coordenacao.</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Todos os status</option>
          <option value={InterventionStatus.OPEN}>Aberto</option>
          <option value={InterventionStatus.IN_PROGRESS}>Em andamento</option>
          <option value={InterventionStatus.WAITING_GUARDIAN}>Aguardando responsavel</option>
          <option value={InterventionStatus.RESOLVED}>Resolvido</option>
          <option value={InterventionStatus.CANCELLED}>Cancelado</option>
        </select>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
                <th className="px-5 py-3">Aluno</th>
                <th className="px-5 py-3">Motivo</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Revisao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="py-12 text-center text-text-secondary">Carregando...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-text-secondary">Nenhum plano encontrado.</td></tr>
              ) : (
                data?.data?.map((plan: any) => (
                  <tr key={plan.id} onClick={() => setSelectedId(plan.id)} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link href={`/students/${plan.student.id}`} className="font-medium text-primary hover:underline">
                        {plan.student.name}
                      </Link>
                      <p className="text-xs text-text-secondary">{plan.student.registrationId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-text-secondary">{plan.reason}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{plan.status}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{new Date(plan.reviewDate).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Detalhe do plano</h2>
          {!selectedId ? (
            <p className="py-12 text-center text-sm text-text-secondary">Selecione um plano.</p>
          ) : !selected ? (
            <p className="py-12 text-center text-sm text-text-secondary">Carregando plano...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">{selected.student.name}</p>
                <p className="text-xs text-text-secondary">{selected.goal}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <select
                  value={selected.status}
                  onChange={(event) => updateStatus.mutate({ id: selected.id, nextStatus: event.target.value as InterventionStatus })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value={InterventionStatus.OPEN}>Aberto</option>
                  <option value={InterventionStatus.IN_PROGRESS}>Em andamento</option>
                  <option value={InterventionStatus.WAITING_GUARDIAN}>Aguardando responsavel</option>
                  <option value={InterventionStatus.RESOLVED}>Resolvido</option>
                  <option value={InterventionStatus.CANCELLED}>Cancelado</option>
                </select>
                <button disabled={updateStatus.isPending} className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-secondary">
                  <Save size={16} /> Status
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  addNote.mutate();
                }}
                className="space-y-2"
              >
                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Adicionar observacao"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button disabled={addNote.isPending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  <MessageSquarePlus size={16} /> Adicionar nota
                </button>
              </form>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-text-secondary">Notas</p>
                {selected.notes?.length ? selected.notes.map((item: any) => (
                  <div key={item.id} className="rounded-lg border border-border px-3 py-2">
                    <p className="text-sm text-text-primary">{item.content}</p>
                    <p className="text-xs text-text-secondary">{new Date(item.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                )) : <p className="text-sm text-text-secondary">Nenhuma nota registrada.</p>}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
