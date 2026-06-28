import { useNavigate } from 'react-router-dom';
import { Users2, CalendarClock, AlertTriangle, Trophy, XCircle, Landmark } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import TrendChart from '../components/charts/TrendChart';
import StageBreakdownChart from '../components/charts/StageBreakdownChart';
import SourceBreakdownChart from '../components/charts/SourceBreakdownChart';
import { useDashboard } from '../hooks/useDashboard';
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

export default function Dashboard() {
  const { summary, trend, loading } = useDashboard();
  const navigate = useNavigate();

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6 animate-fadeIn">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CARD_DEFS.map(({ key, label, icon: Icon, tone }) => (
            <Card key={key} className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${TONE_BG[tone]}`}>
                <Icon size={16} />
              </div>
              {loading ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <p className="text-2xl font-semibold text-ink leading-none mb-1">{summary?.cards?.[key] ?? 0}</p>
              )}
              <p className="text-xs text-ink-muted">{label}</p>
            </Card>
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
                <div key={lead.recordId} onClick={() => navigate(`/leads/${lead.recordId}`)} className="flex items-center justify-between cursor-pointer hover:bg-surface-hover rounded-lg px-2 py-1.5 -mx-2">
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{lead.customerName}</p>
                    <p className="text-xs text-ink-faint">{lead.contactDetails}</p>
                  </div>
                  <Badge variant={PRIORITY_COLORS[lead.priority] || 'neutral'}>{lead.leadStage || 'New'}</Badge>
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
                <div key={lead.recordId} onClick={() => navigate(`/leads/${lead.recordId}`)} className="flex items-center justify-between cursor-pointer hover:bg-surface-hover rounded-lg px-2 py-1.5 -mx-2">
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
