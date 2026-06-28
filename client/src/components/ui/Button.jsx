import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export default function Button({ variant = 'primary', loading = false, children, className = '', disabled, ...rest }) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
