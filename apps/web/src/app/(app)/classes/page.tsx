'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

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
  const confirm = useConfirm();
  const toast = useToast();
  const { data: classes, isLoading } = useClasses();
  const { data: years } = useAcademicYears();
  const { data: subjects } = useSubjects();
  const activeYearId = useMemo(() => years?.find((year: any) => year.isActive)?.id ?? years?.[0]?.id ?? '', [years]);
  const [classForm, setClassForm] = useState({ name: '', grade: '', shift: '', academicYearId: '' });
  const [subjectName, setSubjectName] = useState('');
  const [assignment, setAssignment] = useState({ classId: '', subjectId: '' });
  const [editingClassId, setEditingClassId] = useState('');
  const [classEdit, setClassEdit] = useState({ name: '', grade: '', shift: '' });
  const [editingSubjectId, setEditingSubjectId] = useState('');
  const [subjectEdit, setSubjectEdit] = useState('');
  const [error, setError] = useState('');

  const createClass = useMutation({
    mutationFn: () => api.post('/classes', { ...classForm, academicYearId: classForm.academicYearId || activeYearId }),
    onSuccess: () => {
      setClassForm({ name: '', grade: '', shift: '', academicYearId: '' });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Turma criada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível criar a turma.'; setError(message); toast.error(message); },
  });

  const createSubject = useMutation({
    mutationFn: () => api.post('/subjects', { name: subjectName }),
    onSuccess: () => {
      setSubjectName('');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Disciplina criada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível criar a disciplina.'; setError(message); toast.error(message); },
  });

  const assignSubject = useMutation({
    mutationFn: () => api.post(`/classes/${assignment.classId}/subjects`, { subjectId: assignment.subjectId }),
    onSuccess: () => {
      setAssignment({ classId: '', subjectId: '' });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setError('');
      toast.success('Disciplina vinculada à turma.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível vincular a disciplina.'; setError(message); toast.error(message); },
  });

  const updateClass = useMutation({
    mutationFn: () => api.patch(`/classes/${editingClassId}`, classEdit),
    onSuccess: () => {
      setEditingClassId('');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setError('');
      toast.success('Turma atualizada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar a turma.'; setError(message); toast.error(message); },
  });

  const deleteClass = useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setError('');
      toast.success('Turma removida.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível remover a turma.'; setError(message); toast.error(message); },
  });

  const updateSubject = useMutation({
    mutationFn: () => api.patch(`/subjects/${editingSubjectId}`, { name: subjectEdit }),
    onSuccess: () => {
      setEditingSubjectId('');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setError('');
      toast.success('Disciplina atualizada.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível atualizar a disciplina.'; setError(message); toast.error(message); },
  });

  const deleteSubject = useMutation({
    mutationFn: (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setError('');
      toast.success('Disciplina removida.');
    },
    onError: (err: any) => { const message = err.response?.data?.message ?? 'Não foi possível remover a disciplina.'; setError(message); toast.error(message); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <BookOpen size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Turmas e Disciplinas</h1>
          <p className="text-sm text-text-secondary">Estrutura acadêmica usada por frequência, notas e risco.</p>
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
            <input required placeholder="Série" value={classForm.grade} onChange={(e) => setClassForm((f) => ({ ...f, grade: e.target.value }))} className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
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
            <input required placeholder="Ex.: Matemática" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
            <button disabled={createSubject.isPending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">Criar</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects?.map((subject: any) => (
              <span key={subject.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-text-secondary">
                {editingSubjectId === subject.id ? (
                  <>
                    <input value={subjectEdit} onChange={(event) => setSubjectEdit(event.target.value)} className="w-28 rounded border border-border px-2 py-0.5 text-xs outline-none focus:border-primary" />
                    <button type="button" onClick={() => updateSubject.mutate()} className="font-semibold text-primary">Salvar</button>
                    <button type="button" onClick={() => setEditingSubjectId('')}>Cancelar</button>
                  </>
                ) : (
                  <>
                    {subject.name}
                    <button type="button" onClick={() => { setEditingSubjectId(subject.id); setSubjectEdit(subject.name); }} className="font-semibold text-primary">Editar</button>
                    <button type="button" onClick={async () => { if (await confirm({ title: 'Remover disciplina?', description: 'Essa ação remove a disciplina do sistema.', confirmLabel: 'Remover', destructive: true })) deleteSubject.mutate(subject.id); }} className="font-semibold text-danger">Remover</button>
                  </>
                )}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-text-primary">Vincular disciplina à turma</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError('');
            assignSubject.mutate();
          }}
          className="grid gap-3 md:grid-cols-[1fr_1fr_160px]"
        >
          <select
            required
            value={assignment.classId}
            onChange={(event) => setAssignment((current) => ({ ...current, classId: event.target.value }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione a turma</option>
            {classes?.map((klass: any) => (
              <option key={klass.id} value={klass.id}>{klass.name}</option>
            ))}
          </select>
          <select
            required
            value={assignment.subjectId}
            onChange={(event) => setAssignment((current) => ({ ...current, subjectId: event.target.value }))}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione a disciplina</option>
            {subjects?.map((subject: any) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <button disabled={assignSubject.isPending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            Vincular
          </button>
        </form>
      </section>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Turma</th>
              <th className="px-5 py-3">Série</th>
              <th className="px-5 py-3">Turno</th>
              <th className="px-5 py-3">Ano letivo</th>
              <th className="px-5 py-3">Alunos</th>
              <th className="px-5 py-3">Disciplinas</th>
              <th className="px-5 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="py-10 text-center text-text-secondary">Carregando...</td></tr>
            ) : classes?.length === 0 ? (
              <tr><td colSpan={7} className="py-10 text-center text-text-secondary">Nenhuma turma cadastrada.</td></tr>
            ) : (
              classes?.map((klass: any) => (
                <tr key={klass.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-text-primary">
                    {editingClassId === klass.id ? <input value={classEdit.name} onChange={(event) => setClassEdit((current) => ({ ...current, name: event.target.value }))} className="w-full rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary" /> : klass.name}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">
                    {editingClassId === klass.id ? <input value={classEdit.grade} onChange={(event) => setClassEdit((current) => ({ ...current, grade: event.target.value }))} className="w-20 rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary" /> : klass.grade}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">
                    {editingClassId === klass.id ? <input value={classEdit.shift} onChange={(event) => setClassEdit((current) => ({ ...current, shift: event.target.value }))} className="w-24 rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary" /> : (klass.shift ?? '-')}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass.academicYear?.name}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass._count?.enrollments ?? 0}</td>
                  <td className="px-5 py-3.5 text-text-secondary">{klass.classSubjects?.map((item: any) => item.subject.name).join(', ') || '-'}</td>
                  <td className="px-5 py-3.5">
                    {editingClassId === klass.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => updateClass.mutate()} className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">Salvar</button>
                        <button onClick={() => setEditingClassId('')} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingClassId(klass.id); setClassEdit({ name: klass.name, grade: klass.grade, shift: klass.shift ?? '' }); }} className="rounded border border-border px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-slate-50">Editar</button>
                        <button onClick={async () => { if (await confirm({ title: 'Remover turma?', description: 'A turma será removida do sistema.', confirmLabel: 'Remover', destructive: true })) deleteClass.mutate(klass.id); }} className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50">Remover</button>
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
