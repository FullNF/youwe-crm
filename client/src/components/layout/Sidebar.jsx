import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users2, AlertTriangle, BarChart3, Settings as SettingsIcon, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users2 },
  { to: '/need-attention', label: 'Need Attention', icon: AlertTriangle, badgeKey: 'needAttention' },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const [needAttentionCount, setNeedAttentionCount] = useState(0);

  useEffect(() => {
    api.get('/need-attention/count').then((res) => setNeedAttentionCount(res.data.data.count)).catch(() => {});
  }, []);

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 border-r border-surface-border bg-base-raised flex flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Building2 size={17} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink leading-tight">YouWe CRM</p>
          <p className="text-[11px] text-ink-faint leading-tight">Lead Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, badgeKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-accent/15 text-accent' : 'text-ink-muted hover:text-ink hover:bg-surface-hover'
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <Icon size={16} />
              {label}
            </span>
            {badgeKey === 'needAttention' && needAttentionCount > 0 && (
              <span className="text-[11px] font-semibold bg-danger/20 text-danger rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {needAttentionCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 text-[11px] text-ink-faint border-t border-surface-border">
        YouWe Group · Digifoc Pvt. Ltd.
      </div>
    </aside>
  );
}
