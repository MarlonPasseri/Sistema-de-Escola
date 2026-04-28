'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Save } from 'lucide-react';
import { AttendanceStatus } from '@edupulse/types';
import { api } from '@/lib/api';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: () => api.get('/classes').then((r) => r.data) });
}

function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['attendance-session', sessionId],
    queryFn: () => api.get(`/attendance/sessions/${sessionId}`).then((r) => r.data),
    enabled: Boolean(sessionId),
  });
}

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const { data: classes, isLoading } = useClasses();
  const [classSubjectId, setClassSubjectId] = useState('');
  const [date, setDate] = useState(today());
  const [sessionId, setSessionId] = useState('');
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [error, setError] = useState('');
  const { data: session } = useSession(sessionId);

  const classSubjects = useMemo(() => {
    return (classes ?? []).flatMap((klass: any) =>
      (klass.classSubjects ?? []).map((item: any) => ({
        id: item.id,
        label: `${klass.name} - ${item.subject.name}`,
      })),
    );
  }, [classes]);

  const students = session?.classSubject?.class?.enrollments?.map((item: any) => item.student) ?? [];

  const createSession = useMutation({
    mutationFn: () => api.post('/attendance/sessions', { classSubjectId, date }),
    onSuccess: ({ data }) => {
      setSessionId(data.id);
      setRecords({});
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel criar a sessao.'),
  });

  const saveAttendance = useMutation({
    mutationFn: () =>
      api.post(`/attendance/sessions/${sessionId}/records`, {
        records: students.map((student: any) => ({
          studentId: student.id,
          status: records[student.id] ?? AttendanceStatus.PRESENT,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message ?? 'Nao foi possivel salvar a frequencia.'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <CalendarCheck size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Frequencia</h1>
          <p className="text-sm text-text-secondary">Registre presencas e faltas para alimentar alertas de risco.</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createSession.mutate();
          }}
          className="grid gap-3 md:grid-cols-[1fr_180px_160px]"
        >
          <select
            required
            value={classSubjectId}
            onChange={(event) => setClassSubjectId(event.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Selecione turma e disciplina</option>
            {classSubjects.map((item: any) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button disabled={createSession.isPending || isLoading} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
            Abrir chamada
          </button>
        </form>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-text-primary">Lista de chamada</h2>
          <button
            disabled={!sessionId || saveAttendance.isPending || students.length === 0}
            onClick={() => saveAttendance.mutate()}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} /> Salvar
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs font-semibold uppercase text-text-secondary">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-5 py-3">Matricula</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!sessionId ? (
              <tr><td colSpan={3} className="py-12 text-center text-text-secondary">Abra uma chamada para comecar.</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-text-secondary">Nenhum aluno matriculado nesta turma.</td></tr>
            ) : (
              students.map((student: any) => {
                const saved = session.records?.find((record: any) => record.studentId === student.id);
                const value = records[student.id] ?? saved?.status ?? AttendanceStatus.PRESENT;
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-medium text-text-primary">{student.name}</td>
                    <td className="px-5 py-3.5 text-text-secondary">{student.registrationId}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={value}
                        onChange={(event) => setRecords((current) => ({ ...current, [student.id]: event.target.value as AttendanceStatus }))}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-primary"
                      >
                        <option value={AttendanceStatus.PRESENT}>Presente</option>
                        <option value={AttendanceStatus.ABSENT}>Falta</option>
                        <option value={AttendanceStatus.LATE}>Atraso</option>
                        <option value={AttendanceStatus.JUSTIFIED}>Justificada</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
