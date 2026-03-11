import { motion } from 'framer-motion';

const Table = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg border border-border ${className}`}>
    <table className="w-full text-sm">{children}</table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-surface-200/50">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-border">{children}</tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <motion.tr
    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
    className={`transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-text-secondary ${className}`}>
    {children}
  </td>
);

export default Table;
