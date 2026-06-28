import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { SkeletonRows } from './Skeleton';
import EmptyState from './EmptyState';
import { Inbox } from 'lucide-react';

/**
 * Generic, reusable data table. `columns` = [{ key, label, sortable, render(row) }]
 */
export default function DataTable({ columns, rows, loading, sortBy, sortDir, onSort, onRowClick, emptyTitle = 'No records found', emptyDescription }) {
  if (loading) {
    return (
      <div className="p-4">
        <SkeletonRows rows={6} cols={columns.length} />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={`text-left text-xs font-medium text-ink-muted px-4 py-3 whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-ink' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    sortBy === col.key
                      ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)
                      : <ArrowUpDown size={11} className="opacity-30" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.recordId || row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-surface-border/60 hover:bg-surface-hover transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-ink align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
