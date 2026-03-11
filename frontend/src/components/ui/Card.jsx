import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  glow = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`
        bg-surface-100 border border-border rounded-lg
        ${hover ? 'hover:border-border-light hover:shadow-card-hover' : ''}
        ${glow ? 'shadow-glow border-primary/20' : 'shadow-card'}
        transition-all duration-200
        ${padding} ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-text-primary ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-text-secondary mt-1 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export default Card;
