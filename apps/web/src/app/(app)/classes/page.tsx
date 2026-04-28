'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus } from 'lucide-react';
import { api } from '@/lib/api';

function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
}

function useAcademicYears() {
  return useQuery({ queryKey: ['academic-years'], queryFn: () => api.get('/schools/academic-years').then((r) => r.data) });
}

function useSubjects() {
  return useQuery({ queryKey: ['subjects'], queryFn: () => api.get('/subjects').then((r) => r.data) });
}

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const { data: classes, isLoading } = useClasses();
  const { data: years } = useAcademicYears();
  const { data: subjects } = useSubjects();
  const activeYearId = useMemo(() => years?.find((year: any) => year.isActive)?.id ?? years?.[0]?.id ?? '', [years]);
  const [classForm, setClassForm] = useState({ name: '', grade: '', shift: '', academicYearId: '' });
  const [subjectName, setSubjectName] = useState('');
  const [error, setError] = useState('');

  const createClass = useMutation({
    mutationFn: () => api.post('/classes', { ...classForm, academicYearId: classForm.academicYearId || activeYearId }),
    onSuccess: () => {
      setClassForm({ name: '', grade: '', shift: '', academicYearId: '' });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel criar a turma.'),
  });

  const createSubject = useMutation({
    mutationFn: () => api.post('/subjects', { name: subjectName }),
    onSuccess: () => {
      setSubjectName('');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel criar a disciplina.'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Turmas e Disciplinas</h1>
          <p className="text-sm text-text-secondary">Estrutura academica usada por frequencia, notas e risco.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Nova turma</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              createClass.mutate();
            }}
            className="grid gap-3 sm:grid-cols-4"
          >
            <input required placeholder="Nome" value={classForm.name} onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input required placeholder="Serie" value={classForm.grade} onChange={(e) => setClassForm((f) => ({ ...f, grade: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <input placeholder="Turno" value={classForm.shift} onChange={(e) => setClassForm((f) => ({ ...f, shift: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <button disabled={!activeYearId || createClass.isPending} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
              <Plus size={16} /> Criar
            </button>
          </form>
          {!activeYearId && <p className="mt-3 text-sm text-danger">Crie um ano letivo na API antes de cadastrar turmas.</p>}
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-text-primary">Nova disciplina</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              createSubject.mutate();
            }}
            className="flex gap-2"
          >
            <input required placeholder="Ex.: Matematica" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <button disabled={createSubject.isPending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Criar</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects?.map((subject: any) => (
              <span key={subject.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-text-secondary">{subject.name}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Turma</th>
              <th className="px-5 py-3">Serie</th>
              <th className="px-5 py-3">Turno</th>
              <th className="px-5 py-3">Ano letivo</th>
              <th className="px-5 py-3">Alunos</th>
              <th className="px-5 py-3">Disciplinas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="py-10 text-center text-text-secondary">Carregando...</td></tr>
            ) : classes?.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-text-secondary">Nenhuma turma cadastrada.</td></tr>
            ) : (
              classes?.map((klass: any) => (
                <tr key={klass.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-text-primary">{klass.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass.grade}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass.shift ?? '-'}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass.academicYear?.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass._count?.enrollments ?? 0}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass.classSubjects?.map((item: any) => item.subject.name).join(', ') || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
