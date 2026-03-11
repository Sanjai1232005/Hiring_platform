import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Student',
      description: 'Find jobs, take coding tests, and build your career profile.',
      icon: GraduationCap,
      path: '/student/signup',
      gradient: 'from-primary/10 to-primary/5',
      borderHover: 'hover:border-primary/30',
    },
    {
      title: 'HR / Recruiter',
      description: 'Post jobs, screen resumes with AI, and manage hiring pipelines.',
      icon: Building2,
      path: '/hr/signup',
      gradient: 'from-accent/10 to-accent/5',
      borderHover: 'hover:border-accent/30',
    },
  ];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <PageWrapper className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-white text-lg font-bold">S</span>
            </div>
            <span className="text-xl font-semibold text-text-primary">SmartRecruit</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-3">Choose your role</h1>
          <p className="text-text-secondary">Select how you want to use SmartRecruit.</p>
        </div>

        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <StaggerItem key={role.title}>
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(role.path)}
                  className={`w-full text-left p-6 rounded-lg border border-border bg-gradient-to-br ${role.gradient} ${role.borderHover} transition-all duration-200 group`}
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-200 border border-border flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{role.title}</h3>
                  <p className="text-sm text-text-secondary mb-4">{role.description}</p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    Get started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerList>

        <p className="text-center text-text-muted text-sm mt-8">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </button>
        </p>
      </PageWrapper>
    </div>
  );
};

export default RoleSelectionPage;
