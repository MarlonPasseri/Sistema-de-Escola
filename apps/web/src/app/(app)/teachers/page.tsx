'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

function useTeachers() {
  return useQuery({ queryKey: ['teachers'], queryFn: () => api.get('/teachers').then((r) => r.data) });
}

function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
}

export default function TeachersPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, isLoading } = useTeachers();
  const { data: classes } = useClasses();
  const [error, setError] = useState('');
  const [assignment, setAssignment] = useState({ teacherId: '', classSubjectId: '' });
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', registrationId: '', specialties: '' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'senha123',
    registrationId: '',
    specialties: '',
  });

  const createTeacher = useMutation({
    mutationFn: () => api.post('/teachers', {
      name: form.name,
      email: form.email,
      password: form.password,
      registrationId: form.registrationId || undefined,
      specialties: form.specialties.split(',').map((item) => item.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      setForm({ name: '', email: '', password: 'senha123', registrationId: '', specialties: '' });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setError('');
      toast.success('Professor criado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível criar o professor.'; setError(message); toast.error(message); },
  });

  const assignTeacher = useMutation({
    mutationFn: () => api.post(`/teachers/${assignment.teacherId}/assignments`, {
      classSubjectId: assignment.classSubjectId,
    }),
    onSuccess: () => {
      setAssignment({ teacherId: '', classSubjectId: '' });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setError('');
      toast.success('Professor atribuído.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atribuir o professor.'; setError(message); toast.error(message); },
  });

  const updateTeacher = useMutation({
    mutationFn: () => api.patch(`/teachers/${editingId}`, {
      name: editForm.name,
      email: editForm.email,
      registrationId: editForm.registrationId || undefined,
      specialties: editForm.specialties.split(',').map((item) => item.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      setEditingId('');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setError('');
      toast.success('Professor atualizado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar o professor.'; setError(message); toast.error(message); },
  });

  const deleteTeacher = useMutation({
    mutationFn: (id: string) => api.delete(`/teachers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setError('');
      toast.success('Professor desativado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível desativar o professor.'; setError(message); toast.error(message); },
  });

  const classSubjects = (classes ?? []).flatMap((klass: any) =>
    (klass.classSubjects ?? []).map((item: any) => ({
      id: item.id,
      label: `${klass.name} - ${item.subject.name}`,
    })),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Users size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Professores</h1>
          <p className="text-sm text-text-secondary">Cadastre docentes para vincular turmas, disciplinas e lancamentos.</p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          createTeacher.mutate();
        }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-5">
          <input required placeholder="Nome" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input placeholder="Especialidades" value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <button disabled={createTeacher.isPending} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Plus size={16} /> Criar
          </button>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          assignTeacher.mutate();
        }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2 className="mb-4 font-semibold text-text-primary">Atribuir professor à turma/disciplina</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px]">
          <select
            required
            value={assignment.teacherId}
            onChange={(event) => setAssignment((current) => ({ ...current, teacherId: event.target.value }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione o professor</option>
            {data?.map((teacher: any) => (
              <option key={teacher.id} value={teacher.id}>{teacher.user.name}</option>
            ))}
          </select>
          <select
            required
            value={assignment.classSubjectId}
            onChange={(event) => setAssignment((current) => ({ ...current, classSubjectId: event.target.value }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione turma/disciplina</option>
            {classSubjects.map((item: any) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <button disabled={assignTeacher.isPending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            Atribuir
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Professor</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Especialidades</th>
              <th className="px-5 py-3">Atribuicoes</th>
              <th className="px-5 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="py-10 text-center text-text-secondary">Carregando...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-text-secondary">Nenhum professor cadastrado.</td></tr>
            ) : (
              data?.map((teacher: any) => (
                <tr key={teacher.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-text-primary">{editingId === teacher.id ? <input value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary" /> : teacher.user.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{editingId === teacher.id ? <input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary" /> : teacher.user.email}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{editingId === teacher.id ? <input value={editForm.specialties} onChange={(event) => setEditForm((current) => ({ ...current, specialties: event.target.value }))} className="w-full rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary" /> : (teacher.specialties?.join(', ') || '-')}</td>
                  <td className="px-5 py-3.5 text-text-secondary">
                    {teacher.assignments?.length
                      ? teacher.assignments.map((item: any) => `${item.classSubject.class.name} - ${item.classSubject.subject.name}`).join(', ')
                      : '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    {editingId === teacher.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateTeacher.mutate()} className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">Salvar</button>
                        <button onClick={() => setEditingId('')} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(teacher.id); setEditForm({ name: teacher.user.name, email: teacher.user.email, registrationId: teacher.registrationId ?? '', specialties: teacher.specialties?.join(', ') ?? '' }); }} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-slate-50">Editar</button>
                        <button onClick={async () => { if (await confirm({ title: 'Desativar professor?', description: 'O professor deixará de aparecer nas listas ativas.', confirmLabel: 'Desativar', destructive: true })) deleteTeacher.mutate(teacher.id); }} className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50">Desativar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
