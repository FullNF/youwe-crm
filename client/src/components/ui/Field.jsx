export function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-ink-muted mb-1.5">
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-danger mt-1">{message}</p>;
}

export function FieldWrapper({ label, required, error, children, hint }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-ink-faint mt-1">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}
