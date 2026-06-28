export default function Card({ children, className = '', padded = true, hoverable = false, ...rest }) {
  return (
    <div className={`${hoverable ? 'card-hover' : 'card'} ${padded ? 'p-5' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
