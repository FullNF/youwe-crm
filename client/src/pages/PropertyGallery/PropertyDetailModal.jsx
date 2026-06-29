import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Play, Download, Share2, X, Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { SkeletonRows } from '../../components/ui/Skeleton';
import { getProperty, addPropertyMedia, deletePropertyMedia } from '../../hooks/useProperties';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const getStreamUrl = (mediaId) => `${API_BASE_URL}/public/media/${mediaId}/stream`;

function MediaLightbox({ media, onClose }) {
  if (!media) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white/80 truncate">{media.caption || (media.mediaType === 'Video' ? 'Video' : 'Photo')}</p>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
          {media.mediaType === 'Video' ? (
            <video
              src={getStreamUrl(media.id)}
              controls
              controlsList="nodownload noremoteplayback"
              autoPlay
              className="w-full h-full"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img
              src={media.fullImageUrl}
              alt={media.caption || 'Preview'}
              className="max-w-full max-h-full object-contain"
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
        <div className="flex justify-end mt-3">
          <a href={media.downloadUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary"><Download size={14} /> Download</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailModal({ propertyId, onClose, onChanged }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState('');
  const [newType, setNewType] = useState('Photo');
  const [newCaption, setNewCaption] = useState('');

  const load = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const data = await getProperty(propertyId);
      setProperty(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [propertyId]);

  const handleAddMedia = async () => {
    if (!newLink.trim()) return toast.error('Paste a Google Drive link first.');
    setAdding(true);
    try {
      await addPropertyMedia(propertyId, { mediaType: newType, driveLink: newLink.trim(), caption: newCaption.trim() });
      setNewLink('');
      setNewCaption('');
      toast.success('Media added');
      load();
      onChanged?.();
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    await deletePropertyMedia(propertyId, mediaId);
    toast.success('Removed');
    load();
    onChanged?.();
  };

  const handleShareMedia = async (media) => {
    const url = `${window.location.origin}/share/${media.id}`;
    const shareData = { title: property?.name || 'YouWe Group Property', url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled - not an error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Shareable link copied! No login needed to view it.');
    }
  };

  return (
    <>
      <Modal open={Boolean(propertyId)} onClose={onClose} title={property?.name || 'Property'} width="max-w-3xl">
        {loading ? (
          <SkeletonRows rows={4} cols={3} />
        ) : property ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-ink-muted flex items-center gap-1.5"><MapPin size={13} /> {property.location}</p>
              {property.propertyType && <Badge variant="accent">{property.propertyType}</Badge>}
            </div>
            {property.description && <p className="text-sm text-ink-muted">{property.description}</p>}

            <div>
              <p className="text-xs font-medium text-ink-muted mb-2">Photos & Videos ({property.media.length})</p>
              {property.media.length === 0 ? (
                <p className="text-sm text-ink-faint">No media added yet - use the form below to attach Drive links.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.media.map((m) => (
                    <div key={m.id} className="relative group rounded-xl overflow-hidden bg-surface-hover aspect-square">
                      {m.thumbnailUrl ? (
                        <img src={m.thumbnailUrl} alt={m.caption || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {m.mediaType === 'Video' ? <Video size={22} className="text-ink-faint" /> : <ImageIcon size={22} className="text-ink-faint" />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setLightboxMedia(m)} className="p-2 rounded-full bg-white/90 text-black hover:scale-110 transition-transform" title="Watch">
                          <Play size={14} />
                        </button>
                        <a href={m.downloadUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 rounded-full bg-white/90 text-black hover:scale-110 transition-transform" title="Download">
                          <Download size={14} />
                        </a>
                        <button onClick={() => handleShareMedia(m)} className="p-2 rounded-full bg-white/90 text-accent hover:scale-110 transition-transform" title="Share with customer (no login needed)">
                          <Share2 size={14} />
                        </button>
                        <button onClick={() => handleRemoveMedia(m.id)} className="p-2 rounded-full bg-white/90 text-danger hover:scale-110 transition-transform" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {m.mediaType === 'Video' && (
                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">Video</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-surface-border pt-4">
              <p className="text-xs font-medium text-ink-muted mb-2">Add a photo or video</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={newType} onChange={(e) => setNewType(e.target.value)} options={['Photo', 'Video']} className="sm:w-32" />
                <Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="Paste Google Drive link" className="flex-1" />
                <Input value={newCaption} onChange={(e) => setNewCaption(e.target.value)} placeholder="Caption (optional)" className="sm:w-40" />
                <Button onClick={handleAddMedia} loading={adding}><Plus size={14} /> Add</Button>
              </div>
              <p className="text-xs text-ink-faint mt-1.5">Make sure the file is shared as "Anyone with the link can view" in Google Drive.</p>
            </div>
          </div>
        ) : null}
      </Modal>

      <MediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </>
  );
}
