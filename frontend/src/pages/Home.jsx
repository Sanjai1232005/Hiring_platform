import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight, Zap, Shield, Brain, Users, Code2, BarChart3,
  CheckCircle2, Sparkles, Upload, FileSearch, ClipboardCheck,
  Trophy, Star, ChevronRight, Globe, Rocket, Target, Layers
} from 'lucide-react';
import Button from '../components/ui/Button';
import { PageWrapper, StaggerList, StaggerItem } from '../components/animations/pageTransition';

const AnimatedCounter = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {value}{suffix}
    </motion.span>
  );
};

const SectionHeading = ({ badge, title, description, gradient = 'text-gradient' }) => (
  <div className="text-center mb-16">
    {badge && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        {badge}
      </motion.div>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 leading-tight"
    >
      {title}
    </motion.h2>
    {description && (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-text-secondary max-w-2xl mx-auto text-lg"
      >
        {description}
      </motion.p>
    )}
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Brain, title: 'AI Resume Screening', desc: 'Intelligent scoring and ranking powered by advanced machine learning models.', color: 'from-violet to-primary' },
    { icon: Code2, title: 'Coding Assessments', desc: 'Real-time code evaluation with multi-language support and test case validation.', color: 'from-cyan to-primary' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track your entire hiring pipeline with clean, interactive visual data.', color: 'from-primary to-accent' },
    { icon: Shield, title: 'Cheat Detection', desc: 'AI-powered proctoring ensuring fair and trustworthy assessments.', color: 'from-rose to-amber' },
    { icon: Users, title: 'Candidate Pipeline', desc: 'Multi-stage hiring workflows from resume screening to final offer.', color: 'from-amber to-accent' },
    { icon: Zap, title: 'Fast & Automated', desc: 'End-to-end automation cutting recruitment time by 80%.', color: 'from-cyan to-accent' },
  ];

  const steps = [
    { icon: Upload, num: '01', title: 'Post & Apply', desc: 'Companies post jobs, students apply with AI-optimized profiles.' },
    { icon: FileSearch, num: '02', title: 'AI Screening', desc: 'Resumes scored and ranked instantly by our ML engine.' },
    { icon: ClipboardCheck, num: '03', title: 'Smart Assessments', desc: 'Auto-generated coding tests with real-time evaluation.' },
    { icon: Trophy, num: '04', title: 'Hire the Best', desc: 'Data-driven decisions to select top candidates fast.' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer @ Google', text: 'SmartRecruit made my placement journey seamless. The coding assessments were fair and the platform is beautiful.', avatar: 'PS' },
    { name: 'Rahul Mehta', role: 'HR Lead @ Microsoft', text: 'We reduced our time-to-hire by 70%. The AI screening is incredibly accurate and saves us hundreds of hours.', avatar: 'RM' },
    { name: 'Ananya Patel', role: 'CS Student @ IIT Delhi', text: 'Best recruitment platform I\'ve used. The real-time feedback on coding tests helped me improve and land my dream job.', avatar: 'AP' },
  ];

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated mesh background */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute top-40 right-[15%] w-96 h-96 bg-cyan/8 rounded-full blur-[120px] animate-float-delayed" />
          <div className="absolute bottom-20 left-[30%] w-64 h-64 bg-violet/8 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-40 right-[5%] w-48 h-48 bg-accent/6 rounded-full blur-[80px] animate-float-delayed" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
          <PageWrapper>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 mb-8"
                >
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-cyan/20 border border-primary/30 text-primary text-xs font-semibold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI-Powered Platform
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.05] tracking-tight mb-6"
                >
                  Recruitment,<br />
                  <span className="text-gradient-vivid">reimagined.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-lg text-text-secondary max-w-xl mb-10 leading-relaxed"
                >
                  The intelligent hiring platform that connects exceptional talent
                  with outstanding companies. Skill-first. Data-driven. Beautiful.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-4"
                >
                  <Button size="lg" onClick={() => navigate('/signup')} className="group">
                    Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-8 mt-14"
                >
                  {[
                    { value: '50K', suffix: '+', label: 'Active Students' },
                    { value: '1.2K', suffix: '+', label: 'Companies' },
                    { value: '98', suffix: '%', label: 'Success Rate' },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-8">
                      <div>
                        <p className="text-2xl font-bold text-text-primary">
                          <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-sm text-text-muted">{stat.label}</p>
                      </div>
                      {i < 2 && <div className="w-px h-10 bg-border-light" />}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right - visual element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="hidden lg:block relative"
              >
                <div className="relative">
                  {/* Main card */}
                  <div className="relative bg-surface-100/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-3 h-3 rounded-full bg-rose" />
                      <div className="w-3 h-3 rounded-full bg-amber" />
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-xs text-text-muted ml-2">SmartRecruit Dashboard</span>
                    </div>
                    {/* Mock dashboard */}
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1 bg-surface-200 rounded-lg p-4 border border-border">
                          <div className="text-xs text-text-muted mb-1">Applications</div>
                          <div className="text-2xl font-bold text-text-primary">2,847</div>
                          <div className="text-xs text-accent flex items-center gap-1 mt-1">
                            <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +12.5%
                          </div>
                        </div>
                        <div className="flex-1 bg-surface-200 rounded-lg p-4 border border-border">
                          <div className="text-xs text-text-muted mb-1">Shortlisted</div>
                          <div className="text-2xl font-bold text-text-primary">486</div>
                          <div className="text-xs text-cyan flex items-center gap-1 mt-1">
                            <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +8.3%
                          </div>
                        </div>
                      </div>
                      {/* Chart bars */}
                      <div className="bg-surface-200 rounded-lg p-4 border border-border">
                        <div className="text-xs text-text-muted mb-3">Hiring Pipeline</div>
                        <div className="flex items-end gap-2 h-24">
                          {[60, 85, 45, 70, 90, 55, 75, 95, 65, 80, 50, 88].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                              className={`flex-1 rounded-sm ${
                                i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-cyan' : 'bg-violet'
                              }`}
                              style={{ opacity: 0.7 + (h / 300) }}
                            />
                          ))}
                        </div>
                      </div>
                      {/* Candidate row */}
                      <div className="flex items-center gap-3 bg-surface-200 rounded-lg p-3 border border-border">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-xs font-bold">A</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-text-primary">Aarav Kumar</div>
                          <div className="text-xs text-text-muted">Resume Score: 94/100</div>
                        </div>
                        <div className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">Shortlisted</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating badges */}
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-4 -right-4 bg-surface-100 border border-border rounded-xl px-4 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-xs font-medium text-accent">AI Active</span>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [5, -5, 5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-3 -left-4 bg-surface-100 border border-border rounded-xl px-4 py-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                      <span className="text-xs font-medium text-text-secondary">Auto-evaluated</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </PageWrapper>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-xs font-medium text-text-muted tracking-widest uppercase mb-8"
          >
            Trusted by leading institutions & companies
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4"
          >
            {['IIT Delhi', 'IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'Google', 'Microsoft', 'Amazon'].map((name, i) => (
              <span key={i} className="text-text-muted/40 text-sm font-semibold tracking-wide hover:text-text-muted transition-colors">
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="py-24 relative">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Core Features"
            title={<>Everything you need to <span className="text-gradient">hire smarter</span></>}
            description="A complete AI-powered recruitment toolkit built for modern teams who value speed, fairness, and great candidate experience."
          />
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -4, borderColor: 'rgba(99,102,241,0.3)' }}
                    className="group p-6 rounded-xl border border-border bg-surface-100/90 backdrop-blur-sm hover:shadow-glow transition-all duration-300 h-full"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 border-t border-border/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <div className="absolute top-1/3 right-[10%] w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="How It Works"
            title={<>From application to offer in <span className="text-gradient-cool">4 simple steps</span></>}
            description="Our streamlined process leverages AI at every stage to find the perfect match between talent and opportunity."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative group"
                >
                  <div className="p-6 rounded-xl border border-border bg-surface-50 hover:border-primary/30 transition-all duration-300">
                    <span className="text-4xl font-extrabold text-gradient-vivid opacity-30 mb-3 block">{step.num}</span>
                    <div className="w-10 h-10 rounded-lg bg-surface-200 border border-border flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-2">{step.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                  </div>
                  {/* Connector line */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6">
                      <ChevronRight className="w-5 h-5 text-border-light" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About / Who It's For */}
      <section id="about" className="py-24 border-t border-border/50 relative">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Who It's For"
            title={<>Built for <span className="text-gradient-warm">everyone</span> in hiring</>}
            description="Whether you're a student seeking your dream role or a recruiter finding top talent — we've got you covered."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Rocket, color: 'from-violet to-primary',
                title: 'For Students',
                desc: 'Apply to top companies, take fair coding assessments, and track your application in real-time. Build a verified skill profile that speaks louder than any resume.',
                points: ['One-click applications', 'Real-time progress tracking', 'AI-powered profile optimization'],
              },
              {
                icon: Target, color: 'from-cyan to-accent',
                title: 'For Companies',
                desc: 'Screen thousands of candidates in minutes with AI-driven resume analysis. Create custom coding tests and let automation handle the heavy lifting.',
                points: ['AI resume scoring', 'Custom test creation', 'Automated shortlisting'],
              },
              {
                icon: Layers, color: 'from-amber to-rose',
                title: 'Smart Automation',
                desc: 'Reduce bias and manual effort with intelligent workflows. Our AI ensures every candidate gets a fair evaluation based on skills, not keywords.',
                points: ['Bias-free screening', 'Cheat-proof assessments', 'Data-driven decisions'],
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-xl border border-border bg-surface-100/90 backdrop-blur-sm hover:shadow-glow transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">{card.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{card.desc}</p>
                  <ul className="space-y-2">
                    {card.points.map((point, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-text-muted">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-border/50 relative">
        <div className="absolute left-0 top-1/2 w-72 h-72 bg-violet/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="relative max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Testimonials"
            title={<>Loved by students and <span className="text-gradient-cool">recruiters alike</span></>}
            description="Hear from the people who've transformed their hiring and career journeys with SmartRecruit."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -3 }}
                className="p-6 rounded-xl border border-border bg-surface-50 hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber text-amber" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-cyan/20 border border-border flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Stats */}
      <section className="py-24 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan/5" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Students Registered', icon: Users, color: 'text-primary' },
              { value: '1.2K+', label: 'Partner Companies', icon: Globe, color: 'text-cyan' },
              { value: '200K+', label: 'Tests Completed', icon: ClipboardCheck, color: 'text-violet' },
              { value: '98%', label: 'Satisfaction Rate', icon: Trophy, color: 'text-accent' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-surface-100 border border-border flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-1">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-6">
              <Rocket className="w-3.5 h-3.5" />
              Get Started Today
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 leading-tight">
              Ready to transform your <span className="text-gradient">hiring process</span>?
            </h2>
            <p className="text-text-secondary mb-10 max-w-lg mx-auto text-lg">
              Join thousands of companies and students already using SmartRecruit to build
              the future of talent acquisition.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/student/signup')} className="group">
                Join as Student <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/hr/signup')}>
                Join as Recruiter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-cyan flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">SmartRecruit</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                AI-powered recruitment platform built for modern teams.
                Skill-first. Data-driven. Beautiful.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Platform</p>
              <div className="space-y-2">
                {['Features', 'How it Works', 'Pricing', 'About'].map((link) => (
                  <p key={link} className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer">{link}</p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Get Started</p>
              <div className="space-y-2">
                {['Student Sign Up', 'Recruiter Sign Up', 'Sign In', 'Documentation'].map((link) => (
                  <p key={link} className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer">{link}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">
              &copy; 2026 SmartRecruit. Built with precision. Designed for scale.
            </p>
            <div className="flex items-center gap-4">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <span key={link} className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer">{link}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
