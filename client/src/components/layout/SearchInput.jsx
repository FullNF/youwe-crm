import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative flex-1 min-w-[140px] sm:flex-none sm:w-64 ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-8 pr-8 w-full"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
          <X size={13} />
        </button>
      )}
    </div>
  );
}
