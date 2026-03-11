import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  action,
  actionLabel,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-lg bg-surface-200 border border-border flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action} variant="primary" size="md">
          {actionLabel || 'Get Started'}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
