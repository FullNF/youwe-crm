export default function Card({ children, className = '', padded = true, ...rest }) {
  return (
    <div className={`card ${padded ? 'p-5' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
