'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus, Save, Settings } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

function useSchool() {
  return useQuery({ queryKey: ['school'], queryFn: () => api.get('/schools/current').then((r) => r.data) });
}

function useAcademicYears() {
  return useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/schools/academic-years').then((r) => r.data) });
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: school } = useSchool();
  const { data: years, isLoading } = useAcademicYears();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [schoolForm, setSchoolForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '' });

  useEffect(() => {
    if (!school) return;
    setSchoolForm({
      name: school.name ?? '',
      phone: school.phone ?? '',
      email: school.email ?? '',
      address: school.address ?? '',
    });
  }, [school]);

  const updateSchool = useMutation({
    mutationFn: () => api.patch('/schools/current', {
      name: schoolForm.name,
      phone: schoolForm.phone || undefined,
      email: schoolForm.email || undefined,
      address: schoolForm.address || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school'] });
      setSuccess('Dados da escola salvos.');
      setError('');
      toast.success('Dados da escola salvos.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível salvar a escola.'; setError(message); toast.error(message); },
  });

  const createYear = useMutation({
    mutationFn: () => api.post('/schools/academic-years', yearForm),
    onSuccess: () => {
      setYearForm({ name: '', startDate: '', endDate: '' });
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      setSuccess('Ano letivo criado.');
      setError('');
      toast.success('Ano letivo criado.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível criar o ano letivo.'; setError(message); toast.error(message); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
          <p className="text-sm text-text-secondary">Dados da escola e calendário acadêmico.</p>
        </div>
      </div>

      {success && <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success"><CheckCircle2 size={16} /> {success}</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Dados da escola</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setSuccess('');
            updateSchool.mutate();
          }}
          className="grid gap-3 md:grid-cols-2"
        >
          <input required placeholder="Nome" value={schoolForm.name} onChange={(event) => setSchoolForm((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input type="email" placeholder="E-mail" value={schoolForm.email} onChange={(event) => setSchoolForm((current) => ({ ...current, email: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input placeholder="Telefone" value={schoolForm.phone} onChange={(event) => setSchoolForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input placeholder="Endereço" value={schoolForm.address} onChange={(event) => setSchoolForm((current) => ({ ...current, address: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <button disabled={updateSchool.isPending} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 md:col-span-2">
            <Save size={16} /> Salvar escola
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Novo ano letivo</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            setSuccess('');
            createYear.mutate();
          }}
          className="grid gap-3 md:grid-cols-[1fr_180px_180px_140px]"
        >
          <input required placeholder="Ex.: 2027" value={yearForm.name} onChange={(event) => setYearForm((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="date" value={yearForm.startDate} onChange={(event) => setYearForm((current) => ({ ...current, startDate: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <input required type="date" value={yearForm.endDate} onChange={(event) => setYearForm((current) => ({ ...current, endDate: event.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
          <button disabled={createYear.isPending} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            <Plus size={16} /> Criar
          </button>
        </form>
      </section>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Ano</th>
              <th className="px-5 py-3">Início</th>
              <th className="px-5 py-3">Fim</th>
              <th className="px-5 py-3">Períodos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={4} className="py-10 text-center text-text-secondary">Carregando...</td></tr>
            ) : years?.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-text-secondary">Nenhum ano letivo cadastrado.</td></tr>
            ) : (
              years?.map((year: any) => (
                <tr key={year.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-text-primary">{year.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{new Date(year.startDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{new Date(year.endDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{year.terms?.length ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
