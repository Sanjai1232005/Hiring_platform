import { motion } from 'framer-motion';

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
};

export const PageWrapper = ({ children, className = '' }) => (
  <motion.div
    initial={pageTransition.initial}
    animate={pageTransition.animate}
    exit={pageTransition.exit}
    transition={pageTransition.transition}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerList = ({ children, className = '' }) => (
  <motion.div
    initial="initial"
    animate="animate"
    variants={staggerContainer}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className = '' }) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);
