'use client';

import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

const ROLE_LABEL: Record<string, string> = {
  SCHOOL_ADMIN: 'Administrador',
  COORDINATOR: 'Coordenador',
  TEACHER: 'Professor',
  STUDENT: 'Aluno',
  GUARDIAN: 'Responsável',
};

export function Header() {
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-16 items-center justify-between border-b border-border bg-card px-6"
    >
      <div />

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          className="relative rounded-full p-2 text-text-secondary transition-colors hover:bg-slate-100"
        >
          <Bell size={19} />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.5 }}
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white"
          />
        </motion.button>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-sm"
          >
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </motion.div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-text-primary">{user?.name}</p>
            <p className="text-xs leading-tight text-text-secondary">
              {user?.role ? (ROLE_LABEL[user.role] ?? user.role) : ''}
            </p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
