import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Phone, MapPin, Calendar, User, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import StagePipeline from '../../components/ui/StagePipeline';
import Timeline from '../../components/ui/Timeline';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ContactActions from '../../components/ui/ContactActions';
import { getLead, addRemark, deleteLead } from '../../hooks/useLeads';
import { PRIORITY_COLORS } from '../../constants/options';
import LeadFormModal from './LeadFormModal';

function InfoRow({ icon: Icon, label, value, action }) {
  return (
    <div className="flex items-start justify-between gap-2.5 py-2">
      <div className="flex items-start gap-2.5">
        <Icon size={14} className="text-ink-faint mt-0.5" />
        <div>
          <p className="text-xs text-ink-faint">{label}</p>
          <p className="text-sm text-ink">{value || '—'}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState('');
  const [savingRemark, setSavingRemark] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLead(id);
      setLead(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddRemark = async () => {
    if (!remark.trim()) return;
    setSavingRemark(true);
    try {
      await addRemark(id, remark.trim());
      setRemark('');
      toast.success('Remark added');
      load();
    } finally {
      setSavingRemark(false);
    }
  };

  const handleDelete = async () => {
    await deleteLead(id);
    toast.success('Lead deleted');
    navigate('/leads');
  };

  if (loading) {
    return (
      <>
        <Topbar title="Lead Details" />
        <div className="p-6"><Skeleton className="h-64 w-full" /></div>
      </>
    );
  }

  if (!lead) return null;

  return (
    <>
      <Topbar title={lead.customerName}>
        <Button variant="secondary" onClick={() => setEditOpen(true)}><Pencil size={14} /> <span className="hidden sm:inline">Edit</span></Button>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 size={14} /> <span className="hidden sm:inline">Delete</span></Button>
      </Topbar>

      <div className="p-4 sm:p-6 animate-fadeIn">
        <button onClick={() => navigate('/leads')} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4">
          <ArrowLeft size={14} /> Back to Leads
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-5 lg:col-span-1">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-ink">{lead.customerName}</h2>
                <Badge variant={PRIORITY_COLORS[lead.priority] || 'neutral'} pulse={lead.priority === 'Hot'}>{lead.priority || 'Warm'}</Badge>
              </div>
              <div className="mb-3">
                <StagePipeline stage={lead.leadStage} />
              </div>
              <div className="divide-y divide-surface-border">
                <InfoRow
                  icon={Phone}
                  label="Contact"
                  value={lead.contactDetails}
                  action={<ContactActions size="md" phone={lead.contactDetails} />}
                />
                <InfoRow icon={MapPin} label="Area Need" value={lead.areaNeed} />
                <InfoRow icon={User} label="Lead Managed By" value={lead.leadManagedBy} />
                <InfoRow icon={Calendar} label="Next Follow-up" value={lead.nextFollowUpDate} />
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-ink mb-3">Property Requirement</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-ink-faint">Buy / Rent</p><p className="text-ink">{lead.buyOrRent || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Configuration</p><p className="text-ink">{lead.configuration || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Condition</p><p className="text-ink">{lead.propertyCondition || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Customer Type</p><p className="text-ink">{lead.custType || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Budget (Buy)</p><p className="text-ink">{lead.bidPricePurchase || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Budget (Rent)</p><p className="text-ink">{lead.bidPriceRent || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Need Loan</p><p className="text-ink">{lead.needLoan || 'No'}</p></div>
                <div><p className="text-xs text-ink-faint">Lead Source</p><p className="text-ink">{lead.leadSource || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Visit Status</p><p className="text-ink">{lead.visitStatus || '—'}</p></div>
                <div><p className="text-xs text-ink-faint">Assigned Agent</p><p className="text-ink">{lead.assignedAgent || '—'}</p></div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <Card>
              <h3 className="text-sm font-medium text-ink mb-3">Add a remark</h3>
              <p className="text-xs text-ink-faint mb-3">Remarks are appended to the timeline below and are never overwritten — full history is always preserved.</p>
              <div className="flex gap-2">
                <input
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRemark()}
                  placeholder="e.g. Called, will visit site this weekend"
                  className="input-base flex-1"
                />
                <Button onClick={handleAddRemark} loading={savingRemark}>Add</Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-medium text-ink mb-4">Timeline</h3>
              <Timeline events={lead.timeline} />
            </Card>
          </div>
        </div>
      </div>

      <LeadFormModal open={editOpen} lead={lead} onClose={() => setEditOpen(false)} onSaved={() => load()} />
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        danger
        title="Delete this lead?"
        description="This will permanently remove this lead and its full history."
        confirmLabel="Delete"
      />
    </>
  );
}
