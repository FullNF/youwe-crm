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
import { useLeads, deleteLead } from '../../hooks/useLeads';
import { useDebounce } from '../../hooks/useDebounce';
import { OPTIONS, STAGE_COLORS, PRIORITY_COLORS } from '../../constants/options';
import LeadFormModal from './LeadFormModal';
import toast from 'react-hot-toast';

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
        <div>
          <p className="font-medium text-ink">{row.customerName}</p>
          <p className="text-xs text-ink-faint flex items-center gap-1"><Phone size={10} />{row.contactDetails}</p>
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
      render: (row) => <Badge variant={PRIORITY_COLORS[row.priority] || 'neutral'}>{row.priority || '—'}</Badge>,
    },
    { key: 'leadManagedBy', label: 'Managed By', className: 'hidden md:table-cell' },
    { key: 'nextFollowUpDate', label: 'Next Follow-up', sortable: true, className: 'hidden lg:table-cell' },
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
