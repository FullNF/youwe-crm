import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Image as ImageIcon, Video, Pencil, Trash2, Building2, Upload } from 'lucide-react';
import Topbar from '../../components/layout/Topbar';
import SearchInput from '../../components/layout/SearchInput';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonRows } from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useProperties, useLocations, deleteProperty } from '../../hooks/useProperties';
import { useDebounce } from '../../hooks/useDebounce';
import { OPTIONS } from '../../constants/options';
import PropertyFormModal from './PropertyFormModal';
import BulkImportModal from './BulkImportModal';
import PropertyDetailModal from './PropertyDetailModal';
import toast from 'react-hot-toast';

export default function PropertyGalleryList() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [openPropertyId, setOpenPropertyId] = useState(null);
  const [deletingProperty, setDeletingProperty] = useState(null);

  const params = useMemo(() => ({ search: debouncedSearch, location, propertyType }), [debouncedSearch, location, propertyType]);
  const { properties, loading, refetch } = useProperties(params);
  const locations = useLocations();

  const handleDelete = async () => {
    await deleteProperty(deletingProperty.id);
    toast.success('Property removed');
    setDeletingProperty(null);
    refetch();
  };

  return (
    <>
      <Topbar title="Property Gallery">
        <SearchInput value={search} onChange={setSearch} placeholder="Search property, location..." />
        <select value={location} onChange={(e) => setLocation(e.target.value)} className="bg-base/80 border border-surface-border rounded-xl px-3 py-2 text-sm text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40">
          <option value="">All locations</option>
          {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="bg-base/80 border border-surface-border rounded-xl px-3 py-2 text-sm text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40">
          <option value="">All types</option>
          {OPTIONS.CONFIGURATION.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <Button variant="secondary" onClick={() => setBulkImportOpen(true)}>
          <Upload size={15} /> Bulk Import
        </Button>
        <Button onClick={() => { setEditingProperty(null); setFormOpen(true); }}>
          <Plus size={15} /> Add Property
        </Button>
      </Topbar>

      <div className="p-4 sm:p-6 animate-fadeIn">
        {loading && <div className="p-4"><SkeletonRows rows={4} cols={4} /></div>}

        {!loading && properties.length === 0 && (
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Add a property and attach Google Drive photo/video links - your team will be able to find them instantly by location and type."
            action={<Button onClick={() => setFormOpen(true)}><Plus size={15} /> Add your first property</Button>}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {properties.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
            >
              <Card
                hoverable
                padded={false}
                className="overflow-hidden cursor-pointer group"
                onClick={() => setOpenPropertyId(p.id)}
              >
                <div className="relative h-36 bg-surface-hover flex items-center justify-center overflow-hidden">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <Building2 size={32} className="text-ink-faint" />
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingProperty(p); setFormOpen(true); }}
                      className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingProperty(p); }}
                      className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-danger backdrop-blur-sm transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-ink-faint flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {p.location || 'No location'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.propertyType && <Badge variant="accent">{p.propertyType}</Badge>}
                      {p.furnishing && <Badge variant="neutral">{p.furnishing}</Badge>}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-ink-muted">
                      <span className="flex items-center gap-1"><ImageIcon size={12} /> {p.mediaCounts?.photos || 0}</span>
                      <span className="flex items-center gap-1"><Video size={12} /> {p.mediaCounts?.videos || 0}</span>
                    </div>
                  </div>
                  {p.priceRange && <p className="text-xs text-success font-medium mt-2">{p.priceRange}</p>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <PropertyFormModal
        open={formOpen}
        property={editingProperty}
        onClose={() => setFormOpen(false)}
        onSaved={() => refetch()}
      />

      <BulkImportModal
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onImported={() => refetch()}
      />

      <PropertyDetailModal
        propertyId={openPropertyId}
        onClose={() => setOpenPropertyId(null)}
        onChanged={() => refetch()}
      />

      <ConfirmDialog
        open={Boolean(deletingProperty)}
        onClose={() => setDeletingProperty(null)}
        onConfirm={handleDelete}
        danger
        title="Remove this property?"
        description={`This removes "${deletingProperty?.name}" and all its attached photos/videos from the gallery. The actual files stay on Google Drive - this only removes them from the CRM.`}
        confirmLabel="Remove"
      />
    </>
  );
}
