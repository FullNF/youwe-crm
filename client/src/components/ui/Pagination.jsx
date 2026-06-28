import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, pageSize, onPageChange }) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-ink-muted">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-hover disabled:opacity-30 disabled:hover:bg-transparent"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-ink-muted px-2">Page {page} of {totalPages}</span>
        <button
          className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-hover disabled:opacity-30 disabled:hover:bg-transparent"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
