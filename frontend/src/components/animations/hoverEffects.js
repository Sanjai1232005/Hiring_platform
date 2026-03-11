export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    transition: { duration: 0.2 },
  },
};

export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
};
