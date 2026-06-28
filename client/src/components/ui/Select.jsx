import { forwardRef } from 'react';
import { FieldWrapper } from './Field';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({ label, required, error, hint, options = [], placeholder = 'Select...', className = '', ...rest }, ref) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        <select ref={ref} className={`input-base appearance-none pr-9 ${className}`} {...rest}>
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
      </div>
    </FieldWrapper>
  );
});

export default Select;
