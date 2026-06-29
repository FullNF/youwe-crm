import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Share2, Loader2, MapPin, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AmbientBackground from '../components/ui/AmbientBackground';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const getStreamUrl = (mediaId) => `${API_BASE_URL}/public/media/${mediaId}/stream`;

export default function PublicPropertyView() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    api
      .get(`/public/property/${propertyId}`)
      .then((res) => setProperty(res.data.data))
      .catch(() => setError("This link is invalid or the property has been removed."))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const media = property?.media || [];
  const active = media[activeIndex];

  const goTo = useCallback((index) => {
    setActiveIndex((index + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, goTo]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: property?.name || 'YouWe Group', url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled - not an error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <AmbientBackground />

      <div className="w-full max-w-3xl relative z-10">
        <div className="flex flex-col items-center mb-5">
          <img src="/logo.png" alt="YouWe Group" className="h-10 object-contain mb-2" />
          <p className="text-sm text-ink-muted">Shared by YouWe Group</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-accent" size={28} />
          </div>
        )}

        {!loading && error && (
          <div className="glass rounded-card p-8 text-center">
            <p className="text-ink">{error}</p>
          </div>
        )}

        {!loading && property && (
          <div className="glass rounded-card overflow-hidden shadow-popover">
            <div className="p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3 border-b border-surface-border">
              <div className="min-w-0">
                <p className="font-semibold text-ink text-lg truncate">{property.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {property.location && (
                    <p className="text-xs text-ink-muted flex items-center gap-1">
                      <MapPin size={11} /> {property.location}
                    </p>
                  )}
                  {property.propertyType && <Badge variant="accent">{property.propertyType}</Badge>}
                </div>
              </div>
              <Button onClick={handleShare}>
                <Share2 size={14} /> Share
              </Button>
            </div>

            {media.length === 0 ? (
              <div className="p-12 text-center text-ink-muted">No photos or videos added yet.</div>
            ) : (
              <>
                <div className="aspect-video bg-black relative flex items-center justify-center">
                  {active.mediaType === 'Video' ? (
                    <video
                      key={active.id}
                      src={getStreamUrl(active.id)}
                      controls
                      controlsList="nodownload noremoteplayback"
                      autoPlay
                      className="w-full h-full"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  ) : (
                    <img
                      key={active.id}
                      src={active.fullImageUrl}
                      alt={active.caption || property.name}
                      className="max-w-full max-h-full object-contain"
                      draggable="false"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  )}

                  {media.length > 1 && (
                    <>
                      <button
                        onClick={() => goTo(activeIndex - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => goTo(activeIndex + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeIndex + 1} / {media.length}
                      </span>
                    </>
                  )}

                  {/* Subtle brand watermark - visible even on a publicly shared link */}
                  <div className="absolute bottom-3 right-3 pointer-events-none opacity-75">
                    <img src="/logo.png" alt="" className="h-7 object-contain" />
                  </div>
                </div>

                {active.caption && (
                  <p className="text-sm text-ink-muted px-4 sm:px-5 pt-3">{active.caption}</p>
                )}

                {media.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-4 sm:p-5">
                    {media.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveIndex(i)}
                        className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeIndex ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {m.thumbnailUrl ? (
                          <img src={m.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                            {m.mediaType === 'Video' ? <Video size={16} className="text-ink-faint" /> : <ImageIcon size={16} className="text-ink-faint" />}
                          </div>
                        )}
                        {m.mediaType === 'Video' && (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/60 rounded p-0.5">
                            <Video size={9} className="text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-ink-faint mt-5">
          Shared via YouWe CRM. This link doesn't require an account.
        </p>
      </div>
    </div>
  );
}
