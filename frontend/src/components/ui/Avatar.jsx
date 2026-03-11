const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizes[size]} rounded-lg object-cover border border-border ${className}`}
      />
    );
  }

  return (
    <div className={`
      ${sizes[size]} rounded-lg
      bg-gradient-to-br from-primary/20 to-accent/20
      border border-border
      flex items-center justify-center
      font-semibold text-text-primary
      ${className}
    `}>
      {initials}
    </div>
  );
};

export default Avatar;
