import { forwardRef } from 'react';
import { FieldWrapper } from './Field';

const Input = forwardRef(function Input({ label, required, error, hint, className = '', ...rest }, ref) {
  return (
    <FieldWrapper label={label} required={required} error={error} hint={hint}>
      <input ref={ref} className={`input-base ${className}`} {...rest} />
    </FieldWrapper>
  );
});

export default Input;
