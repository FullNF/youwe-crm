import { Clock } from 'lucide-react';

export default function Timeline({ events = [] }) {
  if (!events.length) {
    return <p className="text-sm text-ink-muted">No activity yet.</p>;
  }

  return (
    <div className="relative pl-5">
      <div className="absolute left-[5px] top-1 bottom-1 w-px bg-surface-border" />
      <div className="space-y-5">
        {events.map((event) => (
          <div key={event.timelineId} className="relative">
            <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-base" />
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-ink">{event.actionType}</span>
              <span className="text-xs text-ink-faint flex items-center gap-1">
                <Clock size={11} /> {new Date(event.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {event.note && <p className="text-sm text-ink-muted">{event.note}</p>}
            {event.createdBy && <p className="text-xs text-ink-faint mt-0.5">by {event.createdBy}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
