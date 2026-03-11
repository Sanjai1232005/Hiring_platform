import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-bold text-text-muted mb-4">404</p>
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Page not found</h1>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Button onClick={() => navigate('/')} variant="secondary">
          Go Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
