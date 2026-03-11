import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-50 border-r border-border">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-semibold text-text-primary">SmartRecruit</span>
          </div>
          <h1 className="text-hero text-text-primary mb-6">
            Hire smarter.<br />
            <span className="text-gradient">Grow faster.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-md leading-relaxed">
            The AI-powered recruitment platform that connects exceptional talent with outstanding opportunities.
          </p>
          <div className="flex items-center gap-8 mt-12 text-text-muted text-sm">
            <div>
              <p className="text-2xl font-bold text-text-primary">50K+</p>
              <p>Students</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-text-primary">1.2K+</p>
              <p>Companies</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-2xl font-bold text-text-primary">98%</p>
              <p>Placement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
