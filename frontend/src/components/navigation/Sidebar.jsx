import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, FileText, ClipboardList,
  ChevronLeft, ChevronRight, LogOut, User, Menu, X, BarChart3, Shield, Video
} from 'lucide-react';

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/student/profile', label: 'Profile', icon: User },
  { to: '/student/task-assessment', label: 'Tasks', icon: ClipboardList },
  { to: '/student/interviews', label: 'Interviews', icon: Video },
];

const hrLinks = [
  { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/hr/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/hr/create', label: 'Create Job', icon: FileText },
  { to: '/hr/task-assessment', label: 'Task Assessment', icon: ClipboardList },
  { to: '/hr/task-results', label: 'Task Results', icon: BarChart3 },
  { to: '/hr/candidate-review', label: 'Review Candidates', icon: Shield },
  { to: '/hr/interviews', label: 'Interviews', icon: Video },
  { to: '/hr/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = role === 'hr' ? hrLinks : studentLinks;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-sm font-semibold text-text-primary">SmartRecruit</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[#111111] text-white border-l-2 border-primary'
                  : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent'
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-300 group-hover:text-white'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
            text-red-400 hover:bg-[#1a1a1a] hover:text-red-300 w-full transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface-100 border border-border rounded-lg"
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-surface-50 border-r border-border z-50 lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 p-1.5 rounded-md hover:bg-surface-200"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex flex-col bg-surface-50 border-r border-border h-screen sticky top-0 overflow-hidden"
      >
        <NavContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface-200 border border-border rounded-full
            flex items-center justify-center hover:bg-surface-300 transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-text-muted" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-text-muted" />
          )}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
