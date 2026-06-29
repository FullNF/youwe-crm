import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users2, AlertTriangle, BarChart3, Settings as SettingsIcon, Images, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import { useSidebar } from '../../context/SidebarContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users2 },
  { to: '/need-attention', label: 'Need Attention', icon: AlertTriangle, badgeKey: 'needAttention' },
  { to: '/property-gallery', label: 'Property Gallery', icon: Images },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const [needAttentionCount, setNeedAttentionCount] = useState(0);
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    api.get('/need-attention/count').then((res) => setNeedAttentionCount(res.data.data.count)).catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile backdrop - tapping it closes the drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={close} />
      )}

      <aside
        className={`fixed md:static top-0 left-0 z-50 w-64 md:w-60 shrink-0 h-screen md:h-screen border-r border-surface-border glass flex flex-col
          transform transition-transform duration-200 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between gap-2.5 px-5 h-16 border-b border-surface-border">
          <div className="flex items-center gap-2.5 group cursor-default">
            <div className="w-9 h-9 rounded-lg bg-white/95 flex items-center justify-center shadow-glow-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 p-1">
              <img src="/logo.png" alt="YouWe Group" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink leading-tight">YouWe CRM</p>
              <p className="text-[11px] text-ink-faint leading-tight">Lead Management</p>
            </div>
          </div>
          <button onClick={close} className="md:hidden text-ink-muted hover:text-ink p-1 -mr-1">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={close} className="group relative block rounded-lg">
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-accent/15 rounded-lg"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive ? 'text-accent' : 'text-ink-muted hover:text-ink hover:bg-surface-hover'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={16} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'drop-shadow-[0_0_6px_rgba(110,86,207,0.65)]' : ''}`} />
                      {label}
                    </span>
                    {badgeKey === 'needAttention' && needAttentionCount > 0 && (
                      <span className="relative inline-flex">
                        <span className="absolute inset-0 rounded-full bg-danger/50 animate-ping" />
                        <span className="relative text-[11px] font-semibold bg-danger/20 text-danger rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {needAttentionCount}
                        </span>
                      </span>
                    )}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 text-[11px] text-ink-faint border-t border-surface-border">
          YouWe Group · Digifoc Pvt. Ltd.
          <span className="block text-ink-faint/60 mt-0.5" title={`Built ${typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : ''}`}>
            build {typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : 'dev'}
          </span>
        </div>
      </aside>
    </>
  );
}
