import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Phone, Trash2, Pencil } from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import SearchInput from '../../components/layout/SearchInput';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StagePipeline from '../../components/ui/StagePipeline';
import ContactActions from '../../components/ui/ContactActions';
import { useLeads, deleteLead } from '../../hooks/useLeads';
import { useDebounce } from '../../hooks/useDebounce';
import { OPTIONS, STAGE_COLORS, PRIORITY_COLORS } from '../../constants/options';
import LeadFormModal from './LeadFormModal';
import toast from 'react-hot-toast';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CLOSED_STAGES = ['Won', 'Lost'];

/** A lead is "unread" (red dot) if it's never been contacted and it's been sitting for 24+ hours, and isn't already closed. */
function isUnread(lead) {
  if (CLOSED_STAGES.includes(lead.leadStage)) return false;
  if (lead.lastContactedAt) return false;
  const created = new Date(lead.createdAt || lead.leadCreatedDate || 0).getTime();
  if (!created) return false;
  return Date.now() - created >= ONE_DAY_MS;
}

const FILTER_DEFS = [
  { key: 'buyOrRent', label: 'Buy/Rent', options: OPTIONS.BUY_OR_RENT },
  { key: 'leadStage', label: 'Stage', options: OPTIONS.LEAD_STAGE },
  { key: 'priority', label: 'Priority', options: OPTIONS.PRIORITY },
  { key: 'leadSource', label: 'Source', options: OPTIONS.LEAD_SOURCE },
  { key: 'needLoan', label: 'Need Loan', options: OPTIONS.NEED_LOAN },
  { key: 'visitStatus', label: 'Visit Status', options: OPTIONS.VISIT_STATUS },
  { key: 'configuration', label: 'Configuration', options: OPTIONS.CONFIGURATION },
];

export default function LeadsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortDir, setSortDir] = useState('desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);

  const params = useMemo(
    () => ({ search: debouncedSearch, ...filters, page, pageSize: 25, sortBy, sortDir }),
    [debouncedSearch, filters, page, sortBy, sortDir]
  );

  const { leads, meta, loading, refetch } = useLeads(params);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setSortDir('asc'); }
  };

  const handleDelete = async () => {
    await deleteLead(deletingLead.recordId);
    toast.success('Lead deleted');
    setDeletingLead(null);
    refetch();
  };

  const columns = [
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: (row) => (
        <div className="flex items-start gap-2">
          {isUnread(row) && (
            <span className="mt-1.5 w-2 h-2 rounded-full bg-danger shadow-glow-danger shrink-0 animate-dangerPulse" title="No contact made yet" />
          )}
          <div>
            <p className="font-medium text-ink">{row.customerName}</p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-ink-faint flex items-center gap-1"><Phone size={10} />{row.contactDetails}</p>
              <ContactActions phone={row.contactDetails} recordId={row.recordId} onLogged={refetch} />
            </div>
          </div>
        </div>
      ),
    },
    { key: 'buyOrRent', label: 'Buy/Rent', sortable: true, className: 'hidden sm:table-cell' },
    { key: 'configuration', label: 'Config', className: 'hidden sm:table-cell' },
    { key: 'areaNeed', label: 'Area', className: 'hidden lg:table-cell', render: (row) => <span className="text-ink-muted truncate max-w-[160px] inline-block">{row.areaNeed}</span> },
    {
      key: 'leadStage', label: 'Stage', sortable: true,
      render: (row) => <StagePipeline stage={row.leadStage} compact />,
    },
    {
      key: 'priority', label: 'Priority', sortable: true,
      render: (row) => <Badge variant={PRIORITY_COLORS[row.priority] || 'neutral'} pulse={row.priority === 'Hot'}>{row.priority || '—'}</Badge>,
    },
    {
      key: 'lastUpdatedBy', label: 'Updated By', className: 'hidden md:table-cell',
      render: (row) => {
        // New format: "Name · 30 Jun, 3:45 PM"
        if (row.lastUpdatedBy && row.lastUpdatedBy.includes(' · ')) {
          const dotIndex = row.lastUpdatedBy.indexOf(' · ');
          const name = row.lastUpdatedBy.slice(0, dotIndex).trim();
          const time = row.lastUpdatedBy.slice(dotIndex + 3).trim();
          return (
            <div>
              {time && <p className="text-[10px] text-ink-faint leading-tight">{time}</p>}
              {name && <p className="text-sm text-ink font-medium">{name}</p>}
            </div>
          );
        }
        // Old leads fallback — show creator + creation date
        if (row.createdBy) {
          const creatorName = row.createdBy.includes('@') ? row.createdBy.split('@')[0] : row.createdBy;
          const createdTime = row.createdAt
            ? new Date(row.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
            : '';
          return (
            <div>
              {createdTime && <p className="text-[10px] text-ink-faint leading-tight">{createdTime}</p>}
              <p className="text-sm text-ink font-medium">{creatorName}</p>
            </div>
          );
        }
        return <span className="text-ink-muted text-sm">—</span>;
      },
    },
    { key: 'leadSource', label: 'Lead Source', className: 'hidden lg:table-cell',
      render: (row) => <span className="text-ink-muted text-sm">{row.leadSource || '—'}</span>,
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setEditingLead(row); setFormOpen(true); }} className="p-1.5 rounded-md text-ink-muted hover:text-accent hover:bg-accent/10">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDeletingLead(row)} className="p-1.5 rounded-md text-ink-muted hover:text-danger hover:bg-danger/10">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Leads">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, phone, area, agent..." />
        <Button onClick={() => { setEditingLead(null); setFormOpen(true); }}>
          <Plus size={15} /> Add Lead
        </Button>
      </Topbar>

      <div className="p-4 sm:p-6 space-y-4 animate-fadeIn">
        <Card padded={false} className="p-3">
          <div className="flex flex-wrap gap-2">
            {FILTER_DEFS.map((f) => (
              <select
                key={f.key}
                value={filters[f.key] || ''}
                onChange={(e) => handleFilterChange(f.key, e.target.value)}
                className="bg-base border border-surface-border rounded-md px-2.5 py-1.5 text-xs text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="">{f.label}: All</option>
                {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ))}
            {Object.values(filters).some(Boolean) && (
              <button onClick={() => setFilters({})} className="text-xs text-accent hover:underline px-2">Clear filters</button>
            )}
          </div>
        </Card>

        <Card padded={false}>
          <DataTable
            columns={columns}
            rows={leads}
            loading={loading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onRowClick={(row) => navigate(`/leads/${row.recordId}`)}
            emptyTitle="No leads match your filters"
            emptyDescription="Try clearing filters or search, or add your first lead."
          />
          {leads.length > 0 && (
            <div className="px-2">
              <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} pageSize={meta.pageSize} onPageChange={setPage} />
            </div>
          )}
        </Card>
      </div>

      <LeadFormModal
        open={formOpen}
        lead={editingLead}
        onClose={() => setFormOpen(false)}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deletingLead)}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDelete}
        danger
        title="Delete this lead?"
        description={`This will permanently remove ${deletingLead?.customerName || 'this lead'} and its history.`}
        confirmLabel="Delete"
      />
    </>
  );
}
