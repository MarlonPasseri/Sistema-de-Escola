'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  GraduationCap, ShieldAlert, TrendingDown,
  MessageSquareOff, ClipboardList, AlertTriangle,
} from 'lucide-react';
import { RiskBadge } from '@/components/ui/risk-badge';
import { api } from '@/lib/api';
import { RiskLevel } from '@edupulse/types';
import Link from 'next/link';

// ── Animation variants ────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

// ── Stat Card ─────────────────────────────────────────────────────────────

const VARIANT_STYLES = {
  default: { wrapper: 'border-border', icon: 'bg-blue-50 text-blue-600', value: 'text-text-primary', glow: '' },
  danger:  { wrapper: 'border-red-100', icon: 'bg-red-50 text-red-600', value: 'text-danger', glow: 'shadow-red-100' },
  warning: { wrapper: 'border-amber-100', icon: 'bg-amber-50 text-amber-600', value: 'text-warning', glow: '' },
  success: { wrapper: 'border-green-100', icon: 'bg-green-50 text-green-600', value: 'text-success', glow: '' },
} as const;

function StatCard({
  title, value, subtitle, icon: Icon, variant = 'default',
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  variant?: keyof typeof VARIANT_STYLES;
}) {
  const s = VARIANT_STYLES[variant];

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={`cursor-default rounded-2xl border ${s.wrapper} bg-card p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <motion.div
          whileHover={{ rotate: 8, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className={`rounded-xl p-2.5 ${s.icon}`}
        >
          <Icon size={18} />
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`mb-1 text-3xl font-bold ${s.value}`}
      >
        {value}
      </motion.p>
      <p className="text-xs text-text-secondary">{subtitle}</p>
    </motion.div>
  );
}

// ── Data hook ─────────────────────────────────────────────────────────────

function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [students, risks] = await Promise.all([
        api.get('/students?limit=1'),
        api.get('/students?riskLevel=HIGH&limit=5'),
      ]);
      return {
        totalStudents: students.data.total as number,
        highRisk: risks.data.data as any[],
        highRiskTotal: risks.data.total as number,
      };
    },
  });
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-0.5 text-sm capitalize text-text-secondary">{today}</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Alunos Ativos"
          value={isLoading ? '—' : (data?.totalStudents ?? 0)}
          subtitle="Total matriculado"
          icon={GraduationCap}
        />
        <StatCard
          title="Risco Alto"
          value={isLoading ? '—' : (data?.highRiskTotal ?? 0)}
          subtitle="Requerem atenção imediata"
          icon={ShieldAlert}
          variant="danger"
        />
        <StatCard
          title="Intervenções Abertas"
          value="—"
          subtitle="Em acompanhamento"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Sem Leitura"
          value="—"
          subtitle="Responsáveis não engajados"
          icon={MessageSquareOff}
          variant="warning"
        />
      </motion.div>

      {/* Bottom grid */}
      <motion.div variants={staggerContainer} className="grid gap-6 lg:grid-cols-2">
        {/* High-risk students list */}
        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-text-primary">Alunos em Risco Alto</h2>
            <Link
              href="/student-success"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ver todos →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="shimmer h-12 rounded-xl"
                  />
                ))}
              </div>
            ) : !data?.highRisk?.length ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mb-2 text-3xl"
                >
                  🎉
                </motion.div>
                <p className="text-sm text-text-secondary">Nenhum aluno em risco alto.</p>
              </motion.div>
            ) : (
              data.highRisk.map((student: any, i: number) => {
                const risk = student.riskScores?.[0];
                const className = student.enrollments?.[0]?.class?.name ?? 'Sem turma';
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={`/students/${student.id}`}
                      className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold text-slate-600"
                        >
                          {student.name[0]}
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-text-primary transition-colors group-hover:text-primary">
                            {student.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {className} · {student.registrationId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {risk && (
                          <span className="text-sm font-bold tabular-nums text-danger">
                            {risk.score}
                          </span>
                        )}
                        {risk && <RiskBadge level={risk.level as RiskLevel} />}
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold text-text-primary">Ações Rápidas</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5">
            {[
              { label: 'Registrar Frequência', href: '/attendance', icon: ClipboardList, icon_class: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' },
              { label: 'Lançar Notas', href: '/grades', icon: TrendingDown, icon_class: 'bg-green-50 text-green-600 group-hover:bg-green-100' },
              { label: 'Enviar Comunicado', href: '/announcements', icon: MessageSquareOff, icon_class: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' },
              { label: 'Nova Intervenção', href: '/interventions', icon: ShieldAlert, icon_class: 'bg-red-50 text-red-600 group-hover:bg-red-100' },
            ].map(({ label, href, icon: Icon, icon_class }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  href={href}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border p-4 text-center transition-all hover:border-primary/25 hover:shadow-sm"
                >
                  <motion.div
                    whileHover={{ rotate: 8 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className={`rounded-xl p-3 transition-colors ${icon_class}`}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <span className="text-xs font-medium leading-tight text-text-primary">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
