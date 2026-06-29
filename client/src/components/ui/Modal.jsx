import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${width} glass rounded-card shadow-popover p-0 max-h-[90vh] flex flex-col ring-1 ring-white/10`}
            style={{ backdropFilter: 'blur(26px) saturate(150%)', WebkitBackdropFilter: 'blur(26px) saturate(150%)' }}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-ink">{title}</h2>
              <button onClick={onClose} className="text-ink-muted hover:text-ink p-1.5 rounded-lg hover:bg-white/10 transition-colors active:scale-90">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 sm:p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
