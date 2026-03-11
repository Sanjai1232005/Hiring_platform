import { motion } from 'framer-motion';

const Table = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg border border-[#1f1f1f] ${className}`}>
    <table className="w-full text-sm">{children}</table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-[#0a0a0a] sticky top-0 z-10">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-[#1f1f1f]">{children}</tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <motion.tr
    className={`transition-colors hover:bg-[#111111] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-[#1f1f1f] ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-gray-300 ${className}`}>
    {children}
  </td>
);

export default Table;
