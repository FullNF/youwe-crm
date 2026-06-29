import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users2, CalendarClock, AlertTriangle, Trophy, XCircle, Landmark, Sparkles } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import CountUp from '../components/ui/CountUp';
import TrendChart from '../components/charts/TrendChart';
import StageBreakdownChart from '../components/charts/StageBreakdownChart';
import SourceBreakdownChart from '../components/charts/SourceBreakdownChart';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';
import { PRIORITY_COLORS } from '../constants/options';

const CARD_DEFS = [
  { key: 'totalLeads', label: 'Total Leads', icon: Users2, tone: 'accent' },
  { key: 'todaysFollowUps', label: "Today's Follow-ups", icon: CalendarClock, tone: 'info' },
  { key: 'needAttention', label: 'Need Attention', icon: AlertTriangle, tone: 'danger' },
  { key: 'won', label: 'Won', icon: Trophy, tone: 'success' },
  { key: 'lost', label: 'Lost', icon: XCircle, tone: 'danger' },
  { key: 'needLoan', label: 'Need Loan', icon: Landmark, tone: 'amber' },
];

const TONE_BG = {
  accent: 'bg-accent/15 text-accent',
  info: 'bg-info/15 text-info',
  danger: 'bg-danger/15 text-danger',
  success: 'bg-success/15 text-success',
  amber: 'bg-amber/15 text-amber',
};

const TONE_AURA = {
  accent: 'bg-accent',
  info: 'bg-info',
  danger: 'bg-danger',
  success: 'bg-success',
  amber: 'bg-amber',
};

const TONE_GRADIENT = {
  accent: 'from-accent/70 via-accent/20 to-transparent',
  info: 'from-info/70 via-info/20 to-transparent',
  danger: 'from-danger/70 via-danger/20 to-transparent',
  success: 'from-success/70 via-success/20 to-transparent',
  amber: 'from-amber/70 via-amber/20 to-transparent',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { summary, trend, loading } = useDashboard();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = (profile?.name || '').split(' ')[0];

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="card p-5 flex items-center justify-between flex-wrap gap-3"
        >
          <div>
            <p className="text-lg font-semibold text-ink flex items-center gap-2">
              {getGreeting()}{firstName ? `, ${firstName}` : ''}
              <Sparkles size={16} className="text-amber" />
            </p>
            <p className="text-sm text-ink-muted mt-0.5">
              Here's what's happening with your leads today.
            </p>
          </div>
          <p className="text-xs text-ink-faint">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CARD_DEFS.map(({ key, label, icon: Icon, tone }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card hoverable className="p-4 group relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${TONE_GRADIENT[tone]}`} />
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-25 ${TONE_AURA[tone]} transition-opacity duration-300 group-hover:opacity-40`} />
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm ring-1 ring-white/10 ${TONE_BG[tone]} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                  <Icon size={17} />
                </div>
                {loading ? (
                  <Skeleton className="h-7 w-12 mb-1" />
                ) : (
                  <p className="relative text-2xl font-semibold text-ink leading-none mb-1">
                    <CountUp value={summary?.cards?.[key] ?? 0} />
                  </p>
                )}
                <p className="relative text-xs text-ink-muted">{label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <p className="text-sm font-medium text-ink mb-1">New leads, last 14 days</p>
            <p className="text-xs text-ink-muted mb-3">Daily volume of incoming leads</p>
            {loading ? <Skeleton className="h-[220px] w-full" /> : <TrendChart data={trend} />}
          </Card>
          <Card>
            <p className="text-sm font-medium text-ink mb-1">Lead source mix</p>
            <p className="text-xs text-ink-muted mb-3">Where leads are coming from</p>
            {loading ? <Skeleton className="h-[220px] w-full" /> : <SourceBreakdownChart data={summary?.sourceBreakdown} />}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-1">
            <p className="text-sm font-medium text-ink mb-1">Pipeline by stage</p>
            <p className="text-xs text-ink-muted mb-3">Where leads currently sit</p>
            {loading ? <Skeleton className="h-[220px] w-full" /> : <StageBreakdownChart data={summary?.stageBreakdown} />}
          </Card>

          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-ink">Recent leads</p>
              <button onClick={() => navigate('/leads')} className="text-xs text-accent hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              {!loading && summary?.recentLeads?.length === 0 && <p className="text-sm text-ink-muted">No leads yet.</p>}
              {!loading && summary?.recentLeads?.map((lead) => (
                <div
                  key={lead.recordId}
                  onClick={() => navigate(`/leads/${lead.recordId}`)}
                  className="flex items-center justify-between cursor-pointer hover:bg-white/[0.04] rounded-xl px-2 py-1.5 -mx-2 transition-all duration-150 hover:translate-x-0.5 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{lead.customerName}</p>
                    <p className="text-xs text-ink-faint">{lead.contactDetails}</p>
                  </div>
                  <Badge variant={PRIORITY_COLORS[lead.priority] || 'neutral'} pulse={lead.priority === 'Hot'}>{lead.leadStage || 'New'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-ink">Today's follow-ups</p>
              <button onClick={() => navigate('/leads')} className="text-xs text-accent hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              {!loading && summary?.todaysFollowUpPreview?.length === 0 && <p className="text-sm text-ink-muted">Nothing scheduled for today. 🎉</p>}
              {!loading && summary?.todaysFollowUpPreview?.map((lead) => (
                <div
                  key={lead.recordId}
                  onClick={() => navigate(`/leads/${lead.recordId}`)}
                  className="flex items-center justify-between cursor-pointer hover:bg-white/[0.04] rounded-xl px-2 py-1.5 -mx-2 transition-all duration-150 hover:translate-x-0.5 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{lead.customerName}</p>
                    <p className="text-xs text-ink-faint">{lead.contactDetails}</p>
                  </div>
                  <span className="text-xs text-ink-muted">{lead.assignedAgent || '—'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
