import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, EyeOff, Clock3 } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import { useNeedAttention } from '../hooks/useNeedAttention';

const ISSUE_TONE = {
  'Duplicate Phone Number': 'danger',
  'Old Lead': 'amber',
  'Lead Not Updated': 'amber',
};

export default function NeedAttention() {
  const { items, loading, resolve, ignore, remindLater } = useNeedAttention();
  const navigate = useNavigate();
  const [ignoreTarget, setIgnoreTarget] = useState(null);
  const [ignoreReason, setIgnoreReason] = useState('');

  const handleIgnoreSubmit = async () => {
    await ignore(ignoreTarget.lead.recordId, ignoreTarget.issueType, ignoreReason);
    setIgnoreTarget(null);
    setIgnoreReason('');
  };

  return (
    <>
      <Topbar title="Need Attention" />
      <div className="p-4 sm:p-6 animate-fadeIn">
        <Card padded={false}>
          {loading && <div className="p-4"><SkeletonRows rows={6} cols={4} /></div>}

          {!loading && items.length === 0 && (
            <EmptyState icon={AlertTriangle} title="All clear" description="No open issues right now. The rule engine re-checks every lead automatically." />
          )}

          {!loading && items.length > 0 && (
            <div className="divide-y divide-surface-border">
              {items.map((item, idx) => (
                <div key={`${item.lead.recordId}-${item.issueType}-${idx}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => navigate(`/leads/${item.lead.recordId}`)}>
                    <Badge variant={ISSUE_TONE[item.issueType] || 'neutral'}>{item.issueType}</Badge>
                    <div className="min-w-0">
                      <p className="text-sm text-ink truncate">{item.lead.customerName || 'Unnamed lead'}</p>
                      <p className="text-xs text-ink-faint truncate">{item.lead.contactDetails || 'No contact'} · {item.lead.leadStage || 'New'} · {item.lead.leadManagedBy || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
                    <Button variant="ghost" onClick={() => resolve(item.lead.recordId, item.issueType)} title="Resolve">
                      <Check size={14} /> <span className="hidden sm:inline">Resolve</span>
                    </Button>
                    <Button variant="ghost" onClick={() => remindLater(item.lead.recordId, item.issueType, 1)} title="Remind tomorrow">
                      <Clock3 size={14} /> <span className="hidden sm:inline">Tomorrow</span>
                    </Button>
                    <Button variant="ghost" onClick={() => remindLater(item.lead.recordId, item.issueType, 3)} title="Remind after 3 days">
                      <Clock3 size={14} /> <span className="hidden sm:inline">3 days</span>
                    </Button>
                    <Button variant="ghost" onClick={() => setIgnoreTarget(item)} title="Ignore">
                      <EyeOff size={14} /> <span className="hidden sm:inline">Ignore</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={Boolean(ignoreTarget)} onClose={() => setIgnoreTarget(null)} title="Ignore this issue" width="max-w-md">
        <p className="text-sm text-ink-muted mb-3">
          Ignoring "{ignoreTarget?.issueType}" for {ignoreTarget?.lead?.customerName} will hide it from this list until something changes on the lead.
        </p>
        <Textarea label="Reason (optional)" value={ignoreReason} onChange={(e) => setIgnoreReason(e.target.value)} placeholder="e.g. Customer asked us to follow up next month" />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setIgnoreTarget(null)}>Cancel</Button>
          <Button onClick={handleIgnoreSubmit}>Ignore</Button>
        </div>
      </Modal>
    </>
  );
}
