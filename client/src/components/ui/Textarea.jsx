import { forwardRef } from 'react';
import { FieldWrapper } from './Field';

const Textarea = forwardRef(function Textarea({ label, required, error, hint, className = '', rows = 3, ...rest }, ref) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <textarea ref={ref} rows={rows} className={`input-base resize-none ${className}`} {...rest} />
    </FieldWrapper>
  );
});

export default Textarea;
