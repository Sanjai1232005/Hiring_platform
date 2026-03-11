const variantStyles = {
  default: 'bg-surface-200 text-text-secondary border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const Badge = ({ children, variant = 'default', className = '', dot = false }) => {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
      border rounded-md
      ${variantStyles[variant]} ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-accent' :
          variant === 'danger' ? 'bg-red-400' :
          variant === 'warning' ? 'bg-yellow-400' :
          variant === 'primary' ? 'bg-primary' :
          variant === 'info' ? 'bg-blue-400' :
          'bg-text-muted'
        }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
