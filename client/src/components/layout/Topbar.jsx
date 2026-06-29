import { LogOut, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

export default function Topbar({ title, children }) {
  const { profile, logout } = useAuth();
  const { toggle } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-30 relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      <div className="h-16 flex items-center gap-2 md:gap-3 px-3 md:px-6">
        <button onClick={toggle} className="md:hidden text-ink-muted hover:text-ink p-1.5 -ml-1 rounded-md hover:bg-surface-hover transition-colors shrink-0">
          <Menu size={20} />
        </button>

        <h1 className="text-base md:text-lg font-semibold text-ink truncate flex-1 md:flex-none">{title}</h1>

        {/* Page actions (search, buttons, filters) sit inline on desktop, move below the title on mobile */}
        <div className="hidden md:flex items-center gap-3 flex-1 justify-end">{children}</div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 md:pl-2 pr-1.5 md:pr-2.5 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold shrink-0 transition-shadow duration-200 hover:shadow-glow-accent">
              {(profile?.name || profile?.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-ink leading-tight">{profile?.name}</p>
              <p className="text-[11px] text-ink-faint leading-tight">{profile?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-ink-faint hidden sm:block transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute right-0 mt-2 w-44 card p-1.5 z-40"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-ink-muted hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {children && (
        <div className="md:hidden flex items-center gap-2 px-3 pb-3 overflow-x-auto">{children}</div>
      )}
    </header>
  );
}
