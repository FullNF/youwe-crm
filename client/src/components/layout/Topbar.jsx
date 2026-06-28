import { LogOut, Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, children }) {
  const { profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-surface-border flex items-center justify-between px-6 sticky top-0 bg-base/95 backdrop-blur z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {children}

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold">
              {(profile?.name || profile?.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-ink leading-tight">{profile?.name}</p>
              <p className="text-[11px] text-ink-faint leading-tight">{profile?.role}</p>
            </div>
            <ChevronDown size={14} className="text-ink-faint" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 card p-1.5 z-40">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm text-ink-muted hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
