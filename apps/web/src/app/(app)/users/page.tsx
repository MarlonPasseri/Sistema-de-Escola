'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, UsersRound } from 'lucide-react';
import { UserRole } from '@edupulse/types';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

const ROLE_LABEL: Record<string, string> = {
  SCHOOL_ADMIN: 'Administração',
  COORDINATOR: 'Coordenação',
  TEACHER: 'Professor',
  STUDENT: 'Aluno',
  GUARDIAN: 'Responsável',
  SUPER_ADMIN: 'Super admin',
};

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users', { params: { limit: 100 } }).then((r) => r.data),
  });
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, isLoading } = useUsers();
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ name: '', email: '', role: UserRole.COORDINATOR, phone: '' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: 'senha123',
    role: UserRole.COORDINATOR,
    phone: '',
  });

  const createUser = useMutation({
    mutationFn: () => api.post('/users', {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      phone: form.phone || undefined,
    }),
    onSuccess: () => {
      setForm({ name: '', email: '', password: 'senha123', role: UserRole.COORDINATOR, phone: '' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError('');
      toast.success('Usuário criado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível criar o usuário.'; setError(message); toast.error(message); },
  });

  const updateUser = useMutation({
    mutationFn: () => api.patch(`/users/${editingId}`, {
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      phone: editForm.phone || undefined,
    }),
    onSuccess: () => {
      setEditingId('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError('');
      toast.success('Usuário atualizado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar o usuário.'; setError(message); toast.error(message); },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setError('');
      toast.success('Usuário desativado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível desativar o usuário.'; setError(message); toast.error(message); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <UsersRound size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Usuários</h1>
          <p className="text-sm text-text-secondary">Gerencie contas administrativas e perfis de acesso.</p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError('');
          createUser.mutate();
        }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_130px_170px_150px_120px]">
          <input required placeholder="Nome" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="email" placeholder="E-mail" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="password" placeholder="Senha" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            <option value={UserRole.SCHOOL_ADMIN}>Administração</option>
            <option value={UserRole.COORDINATOR}>Coordenação</option>
            <option value={UserRole.TEACHER}>Professor</option>
            <option value={UserRole.GUARDIAN}>Responsável</option>
            <option value={UserRole.STUDENT}>Aluno</option>
          </select>
          <input placeholder="Telefone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <button disabled={createUser.isPending} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Plus size={16} /> Criar
          </button>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Perfil</th>
              <th className="px-5 py-3">Telefone</th>
              <th className="px-5 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="py-10 text-center text-text-secondary">Carregando...</td></tr>
            ) : data?.data?.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-text-secondary">Nenhum usuário cadastrado.</td></tr>
            ) : (
              data?.data?.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  {editingId === user.id ? (
                    <>
                      <td className="px-5 py-3.5"><input value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary" /></td>
                      <td className="px-5 py-3.5"><input type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary" /></td>
                      <td className="px-5 py-3.5">
                        <select value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as UserRole }))} className="rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary">
                          <option value={UserRole.SCHOOL_ADMIN}>Administração</option>
                          <option value={UserRole.COORDINATOR}>Coordenação</option>
                          <option value={UserRole.TEACHER}>Professor</option>
                          <option value={UserRole.GUARDIAN}>Responsável</option>
                          <option value={UserRole.STUDENT}>Aluno</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5"><input value={editForm.phone} onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-primary" /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => updateUser.mutate()} className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">Salvar</button>
                          <button onClick={() => setEditingId('')} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary">Cancelar</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 font-medium text-text-primary">{user.name}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{user.email}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{ROLE_LABEL[user.role] ?? user.role}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{user.phone ?? '-'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingId(user.id); setEditForm({ name: user.name, email: user.email, role: user.role, phone: user.phone ?? '' }); }} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-slate-50">Editar</button>
                          <button onClick={async () => { if (await confirm({ title: 'Desativar usuário?', description: 'A conta deixará de acessar o sistema.', confirmLabel: 'Desativar', destructive: true })) deleteUser.mutate(user.id); }} className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50">Desativar</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
