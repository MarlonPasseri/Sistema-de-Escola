'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback((confirmed: boolean) => {
    setPending((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {pending && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl"
            >
              <div className="flex gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${pending.destructive ? 'bg-red-50 text-danger' : 'bg-amber-50 text-warning'}`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-text-primary">{pending.title}</h2>
                  {pending.description && <p className="mt-1 text-sm text-text-secondary">{pending.description}</p>}
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => close(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-slate-50">
                  {pending.cancelLabel ?? 'Cancelar'}
                </button>
                <button onClick={() => close(true)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${pending.destructive ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary/90'}`}>
                  {pending.confirmLabel ?? 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside ConfirmProvider');
  return context;
}
