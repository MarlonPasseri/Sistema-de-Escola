'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck,
  ClipboardList, MessageSquare, AlertTriangle, ShieldAlert, BookOpen, LogOut, Zap, Settings,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Alunos em Risco', href: '/student-success', icon: ShieldAlert, highlight: true },
  { label: 'Alunos', href: '/students', icon: GraduationCap },
  { label: 'Turmas', href: '/classes', icon: BookOpen },
  { label: 'Frequência', href: '/attendance', icon: CalendarCheck },
  { label: 'Notas', href: '/grades', icon: ClipboardList },
  { label: 'Comunicados', href: '/announcements', icon: MessageSquare },
  { label: 'Intervenções', href: '/interventions', icon: AlertTriangle },
  { label: 'Professores', href: '/teachers', icon: Users },
  { label: 'Usuários', href: '/users', icon: Users },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-screen w-60 flex-col overflow-hidden bg-sidebar">
      {/* Top glow */}
      <div className="sidebar-glow" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-16 items-center gap-3 border-b border-white/5 px-5"
      >
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
        >
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <span className="text-lg font-bold text-white">
          Edu<span className="text-blue-400">Pulse</span>
        </span>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV.map(({ label, href, icon: Icon, highlight }, i) => {
          const active = pathname === href || pathname.startsWith(href + '/');

          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={href}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-600/18 text-white'
                      : highlight
                        ? 'text-yellow-400 hover:bg-white/7 hover:text-yellow-300'
                        : 'text-slate-400 hover:bg-white/7 hover:text-slate-100',
                  )}
                >
                  {/* Active indicator bar */}
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="nav-active-bar"
                        className="nav-indicator"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                  </AnimatePresence>

                  <Icon
                    size={17}
                    className={cn(
                      'transition-colors',
                      active ? 'text-blue-400' : '',
                    )}
                  />
                  <span>{label}</span>

                  {/* Pulsing dot for highlighted item */}
                  {highlight && !active && (
                    <motion.span
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-yellow-400"
                      animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/5 px-3 py-3">
        <motion.button
          onClick={logout}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/7 hover:text-slate-200"
        >
          <LogOut size={17} />
          Sair
        </motion.button>
      </div>
    </aside>
  );
}
