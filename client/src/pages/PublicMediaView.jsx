import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Share2, Loader2, MapPin } from 'lucide-react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import AmbientBackground from '../components/ui/AmbientBackground';

export default function PublicMediaView() {
  const { mediaId } = useParams();
  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/public/media/${mediaId}`)
      .then((res) => setMedia(res.data.data))
      .catch(() => setError("This link is invalid or the media has been removed."))
      .finally(() => setLoading(false));
  }, [mediaId]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: media?.propertyName || 'YouWe Group', url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the share sheet - not an error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AmbientBackground />

      <div className="w-full max-w-2xl relative z-10">
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

        {!loading && media && (
          <div className="glass rounded-card overflow-hidden shadow-popover">
            <div className="aspect-video bg-black relative">
              <iframe
                src={media.previewUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                title={media.caption || media.propertyName}
              />
              {/* Subtle brand watermark - visible even on a publicly shared link */}
              <div className="absolute bottom-3 right-3 pointer-events-none opacity-75">
                <img src="/logo.png" alt="" className="h-7 object-contain" />
              </div>
            </div>
            <div className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{media.propertyName}</p>
                {media.location && (
                  <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> {media.location}
                  </p>
                )}
              </div>
              <Button onClick={handleShare}>
                <Share2 size={14} /> Share
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-ink-faint mt-5">
          Shared via YouWe CRM. This link doesn't require an account.
        </p>
      </div>
    </div>
  );
}
