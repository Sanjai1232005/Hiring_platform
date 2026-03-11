import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Brain, Users, Code2, BarChart3 } from 'lucide-react';
import Button from '../components/ui/Button';
import { PageWrapper, StaggerList, StaggerItem } from '../components/animations/pageTransition';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: 'AI Resume Screening', desc: 'Intelligent scoring and ranking with machine learning.' },
    { icon: Code2, title: 'Coding Assessments', desc: 'Real-time code evaluation with test case validation.' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track hiring pipeline with clean visual data.' },
    { icon: Shield, title: 'Cheat Detection', desc: 'AI-powered proctoring for fair assessments.' },
    { icon: Users, title: 'Candidate Pipeline', desc: 'Multi-stage hiring workflow from resume to offer.' },
    { icon: Zap, title: 'Fast & Automated', desc: 'End-to-end automation for modern recruitment.' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24">
          <PageWrapper>
            <div className="flex items-center gap-2 mb-6">
              <div className="px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                AI-Powered Platform
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-hero font-bold text-text-primary leading-none tracking-tight mb-6">
              Recruitment,<br />
              <span className="text-gradient">reimagined.</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-xl mb-10 leading-relaxed">
              The intelligent hiring platform that connects exceptional talent
              with outstanding companies. Skill-first. Data-driven. Beautiful.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>

            <div className="flex items-center gap-8 mt-16 text-text-muted text-sm">
              <div>
                <p className="text-2xl font-bold text-text-primary">50K+</p>
                <p>Active Students</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-bold text-text-primary">1.2K+</p>
                <p>Companies</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-bold text-text-primary">98%</p>
                <p>Success Rate</p>
              </div>
            </div>
          </PageWrapper>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Everything you need to hire smarter
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              A complete recruitment toolkit built for modern teams.
            </p>
          </div>
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="p-6 rounded-lg border border-border bg-surface-100 hover:border-border-light transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-200 border border-border flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
                    <p className="text-sm text-text-secondary">{f.desc}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['For Students', 'Apply, test, and track applications all in one place. Build a verified profile that speaks for itself.'],
              ['For Companies', 'Screen candidates faster with AI-driven resume analysis and automated coding evaluations.'],
              ['Smart Automation', 'Reduce bias and manual effort. Let intelligent workflows handle the heavy lifting.'],
            ].map(([title, desc], i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-surface-50">
                <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Ready to transform your hiring?</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Join thousands of companies and students using SmartRecruit.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/student/signup')}>
              Join as Student
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/hr/signup')}>
              Join as Recruiter
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm font-medium text-text-secondary">SmartRecruit</span>
          </div>
          <p className="text-xs text-text-muted">
            Built with precision. Designed for scale.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
