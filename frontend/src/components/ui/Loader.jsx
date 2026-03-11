import { motion } from 'framer-motion';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-border border-t-primary rounded-full animate-spin ${className}`} />
  );
};

export const SkeletonLine = ({ className = '' }) => (
  <div className={`bg-surface-200 rounded animate-pulse ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-surface-100 border border-border rounded-lg p-6 space-y-4">
    <SkeletonLine className="h-4 w-3/4" />
    <SkeletonLine className="h-3 w-1/2" />
    <div className="space-y-2 pt-2">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-5/6" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <div className="bg-surface-200/50 px-4 py-3">
      <div className="flex gap-8">
        {[1, 2, 3, 4].map(i => (
          <SkeletonLine key={i} className="h-3 w-20" />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3 border-t border-border">
        <div className="flex gap-8">
          {[1, 2, 3, 4].map(j => (
            <SkeletonLine key={j} className="h-3 w-24" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonProfile = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <SkeletonLine className="w-16 h-16 rounded-lg" />
      <div className="space-y-2">
        <SkeletonLine className="h-5 w-40" />
        <SkeletonLine className="h-3 w-28" />
      </div>
    </div>
    <div className="space-y-3">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-4/5" />
      <SkeletonLine className="h-3 w-3/5" />
    </div>
  </div>
);

const Loader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-border rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-text-secondary font-medium">Loading...</p>
    </div>
  </motion.div>
);

export default Loader;
