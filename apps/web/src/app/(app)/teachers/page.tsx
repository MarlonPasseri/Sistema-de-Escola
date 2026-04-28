'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { api } from '@/lib/api';

function useTeachers() {
  return useQuery({ queryKey: ['teachers'], queryFn: () => api.get('/teachers').then((r) => r.data) });
}

export default function TeachersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useTeachers();
  const [error, setError] = useState('');
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
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel criar o professor.'),
  });

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

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Professor</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Especialidades</th>
              <th className="px-5 py-3">Atribuicoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="py-10 text-center text-text-secondary">Carregando...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-text-secondary">Nenhum professor cadastrado.</td></tr>
            ) : (
              data?.map((teacher: any) => (
                <tr key={teacher.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-text-primary">{teacher.user.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{teacher.user.email}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{teacher.specialties?.join(', ') || '-'}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{teacher.assignments?.length ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
