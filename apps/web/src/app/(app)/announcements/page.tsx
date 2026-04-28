'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import { AnnouncementAudience } from '@edupulse/types';
import { api } from '@/lib/api';

function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => api.get('/announcements', { params: { limit: 50 } }).then((r) => r.data),
  });
}

function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
}

function useReadStatus(id: string) {
  return useQuery({
    queryKey: ['announcements', id, 'read-status'],
    queryFn: () => api.get(`/announcements/${id}/read-status`).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAnnouncements();
  const { data: classes } = useClasses();
  const [selectedId, setSelectedId] = useState('');
  const { data: readStatus } = useReadStatus(selectedId);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    audience: AnnouncementAudience.ALL,
    classId: '',
  });

  const createAnnouncement = useMutation({
    mutationFn: () => api.post('/announcements', {
      title: form.title,
      content: form.content,
      audience: form.audience,
      classId: form.audience === AnnouncementAudience.CLASS ? form.classId : undefined,
    }),
    onSuccess: () => {
      setForm({ title: '', content: '', audience: AnnouncementAudience.ALL, classId: '' });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel enviar o comunicado.'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <MessageSquare size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Comunicados</h1>
          <p className="text-sm text-text-secondary">Envie avisos oficiais e acompanhe leitura dos responsaveis.</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Novo comunicado</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            createAnnouncement.mutate();
          }}
          className="space-y-3"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px]">
            <input
              required
              placeholder="Titulo"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <select
              value={form.audience}
              onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value as AnnouncementAudience }))}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value={AnnouncementAudience.ALL}>Todos</option>
              <option value={AnnouncementAudience.CLASS}>Turma</option>
              <option value={AnnouncementAudience.TEACHER}>Professores</option>
            </select>
            <select
              value={form.classId}
              onChange={(event) => setForm((current) => ({ ...current, classId: event.target.value }))}
              disabled={form.audience !== AnnouncementAudience.CLASS}
              required={form.audience === AnnouncementAudience.CLASS}
              className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-slate-100"
            >
              <option value="">Selecione a turma</option>
              {classes?.map((klass: any) => (
                <option key={klass.id} value={klass.id}>{klass.name}</option>
              ))}
            </select>
          </div>
          <textarea
            required
            rows={5}
            placeholder="Conteudo do comunicado"
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
          <div className="flex justify-end">
            <button disabled={createAnnouncement.isPending} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Send size={16} /> Enviar comunicado
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-text-primary">Historico</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
                <th className="px-5 py-3">Titulo</th>
                <th className="px-5 py-3">Publico</th>
                <th className="px-5 py-3">Leitura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={3} className="py-12 text-center text-text-secondary">Carregando...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={3} className="py-12 text-center text-text-secondary">Nenhum comunicado enviado.</td></tr>
              ) : (
                data?.data?.map((announcement: any) => (
                  <tr
                    key={announcement.id}
                    onClick={() => setSelectedId(announcement.id)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-text-primary">{announcement.title}</p>
                      <p className="text-xs text-text-secondary">{new Date(announcement.createdAt).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-5 py-3.5 text-text-secondary">{announcement.audience}</td>
                    <td className="px-5 py-3.5 text-text-secondary">
                      {announcement.readCount ?? 0}/{announcement._count?.recipients ?? 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Status de leitura</h2>
          {!selectedId ? (
            <p className="py-12 text-center text-sm text-text-secondary">Selecione um comunicado.</p>
          ) : !readStatus ? (
            <p className="py-12 text-center text-sm text-text-secondary">Carregando status...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-text-secondary">Total</p>
                  <p className="text-xl font-bold text-text-primary">{readStatus.total}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-text-secondary">Lidos</p>
                  <p className="text-xl font-bold text-success">{readStatus.readCount}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-xs text-text-secondary">Pendentes</p>
                  <p className="text-xl font-bold text-danger">{readStatus.unreadCount}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-text-secondary">Nao lidos</p>
                <div className="max-h-80 space-y-2 overflow-auto">
                  {readStatus.unread?.length ? readStatus.unread.map((recipient: any) => (
                    <div key={recipient.id} className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary">
                      {recipient.student?.name ?? recipient.userId ?? 'Destinatario'}
                    </div>
                  )) : <p className="text-sm text-success">Todos leram.</p>}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
