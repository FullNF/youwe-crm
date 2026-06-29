import { forwardRef } from 'react';
import { FieldWrapper } from './Field';

const Input = forwardRef(function Input({ label, required, error, hint, icon: Icon, className = '', ...rest }, ref) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />}
        <input ref={ref} className={`input-base ${Icon ? 'pl-9' : ''} ${className}`} {...rest} />
      </div>
    </FieldWrapper>
  );
});

export default Input;
