import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
            focused ? 'text-primary' : 'text-text-muted'
          }`} />
        )}
        <input
          ref={ref}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-surface-100 border rounded-lg px-4 py-3 text-sm text-text-primary
            placeholder:text-text-muted
            transition-all duration-200
            focus:outline-none focus:border-primary/50 focus:shadow-glow
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500/50' : 'border-border hover:border-border-light'}
          `}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-red-400 mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className="
          w-full bg-surface-100 border border-border rounded-lg px-4 py-3 text-sm text-text-primary
          placeholder:text-text-muted resize-none
          transition-all duration-200
          focus:outline-none focus:border-primary/50 focus:shadow-glow
          hover:border-border-light
        "
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(({
  label,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className="
          w-full bg-surface-100 border border-border rounded-lg px-4 py-3 text-sm text-text-primary
          transition-all duration-200 appearance-none
          focus:outline-none focus:border-primary/50 focus:shadow-glow
          hover:border-border-light cursor-pointer
        "
        {...props}
      >
        {children}
      </select>
    </div>
  );
});

Select.displayName = 'Select';

export default Input;
