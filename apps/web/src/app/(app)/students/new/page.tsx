'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    registrationId: '',
    name: '',
    birthDate: '',
    gender: '',
    address: '',
    notes: '',
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== ''),
      );
      const { data } = await api.post('/students', payload);
      router.push(`/students/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Não foi possível cadastrar o aluno.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/students" className="rounded-lg border border-border p-2 text-text-secondary hover:bg-slate-50">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Novo Aluno</h1>
          <p className="text-sm text-text-secondary">Cadastro base para alimentar acompanhamento, turmas e risco.</p>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-text-secondary">Matrícula</span>
            <input
              required
              value={form.registrationId}
              onChange={(e) => update('registrationId', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-text-secondary">Nome</span>
            <input
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-text-secondary">Nascimento</span>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => update('birthDate', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase text-text-secondary">Gênero</span>
            <select
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Não informado</option>
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
              <option value="OTHER">Outro</option>
            </select>
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-text-secondary">Endereço</span>
            <input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-text-secondary">Observações</span>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end">
          <button
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar aluno'}
          </button>
        </div>
      </form>
    </div>
  );
}
