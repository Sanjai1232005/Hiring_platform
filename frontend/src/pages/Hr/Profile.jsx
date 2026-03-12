import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, Building2, UserCircle, MapPin, Linkedin,
  Briefcase, Users, UserCheck, UserX, Calendar, Edit3,
  Save, X, Plus, TrendingUp, Target, Activity, ChevronDown,
  Award, BarChart3, Clock, MessageCircle,
} from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Loader from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PageWrapper, staggerItem } from '../../components/animations/pageTransition';

/* ── Stat mini card ── */
const StatMini = ({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) => (
  <div className="bg-surface-100 border border-border rounded-xl p-4 flex items-center gap-3 hover:border-border-light transition-colors">
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-[11px] text-text-muted">{label}</p>
    </div>
  </div>
);

/* ── Info Row ── */
const InfoRow = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-text-muted" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
          {value}
        </a>
      ) : (
        <p className="text-sm text-text-primary break-words">{value || '—'}</p>
      )}
    </div>
  </div>
);

/* ── Skill chip input ── */
const SkillEditor = ({ skills, onChange }) => {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const val = input.trim();
    if (val && !skills.includes(val)) {
      onChange([...skills, val]);
      setInput('');
    }
  };

  const removeSkill = (idx) => onChange(skills.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">Skills & Expertise</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            {s}
            <button onClick={() => removeSkill(i)} className="hover:text-red-400 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          placeholder="Add a skill..."
          className="flex-1 bg-surface-100 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
        <Button variant="secondary" size="sm" onClick={addSkill} disabled={!input.trim()}>
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

/* ── Main Profile Page ── */
const HrProfilePage = () => {
  const [hrData, setHrData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const [profileRes, statsRes] = await Promise.all([
        axios.get(BASE_URL + '/hr/getProfile', { headers: { Authorization: 'Bearer ' + token } }),
        axios.get(BASE_URL + '/hr/profile-stats', { headers: { Authorization: 'Bearer ' + token } }),
      ]);
      setHrData(profileRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const startEdit = () => {
    setForm({
      name: hrData.name || '',
      companyName: hrData.companyName || '',
      position: hrData.position || '',
      department: hrData.department || '',
      contact: hrData.contact || '',
      location: hrData.location || '',
      bio: hrData.bio || '',
      linkedin: hrData.linkedin || '',
      skills: hrData.skills || [],
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(BASE_URL + '/hr/updateProfile', form, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setToast('Profile updated successfully');
      setTimeout(() => setToast(null), 3000);
      setEditing(false);
      await fetchProfile();
    } catch (err) {
      console.error(err);
      setToast('Failed to update profile');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) return <Loader />;
  if (!hrData) return <div className="flex items-center justify-center min-h-[60vh] text-text-muted">No HR data found</div>;

  const joinedDate = hrData.joinedAt ? new Date(hrData.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
  const completionFields = ['name', 'email', 'companyName', 'position', 'contact', 'location', 'bio', 'linkedin'];
  const filledCount = completionFields.filter((f) => hrData[f]).length;
  const completionPct = Math.round((filledCount / completionFields.length) * 100);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Toast ── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 bg-surface-100 border border-accent/30 text-accent px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-surface-100 border border-border rounded-2xl overflow-hidden"
        >
          {/* gradient banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb,99,102,241),0.15),transparent_70%)]" />
            <div className="absolute top-3 right-3">
              {!editing ? (
                <Button variant="ghost" size="sm" onClick={startEdit} className="bg-surface/60 backdrop-blur-sm">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEdit} className="bg-surface/60 backdrop-blur-sm">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={saveProfile} loading={saving} className="bg-surface/60 backdrop-blur-sm">
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* avatar + name section */}
          <div className="px-6 pb-6 -mt-10 relative z-10">
            <div className="flex items-end gap-5">
              <div className="ring-4 ring-surface-100 rounded-xl">
                <Avatar name={hrData.name} src={hrData.avatar} size="xl" />
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary truncate">
                    {editing ? form.name : hrData.name}
                  </h1>
                  <Badge variant="primary" dot>HR</Badge>
                </div>
                <p className="text-sm text-text-muted mt-0.5">
                  {hrData.position || 'No position set'}
                  {hrData.department && <span className="text-text-muted"> · {hrData.department}</span>}
                  {hrData.companyName && <span className="text-text-muted"> @ {hrData.companyName}</span>}
                </p>
                {hrData.bio && !editing && (
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2 max-w-2xl">{hrData.bio}</p>
                )}
              </div>
            </div>

            {/* profile completion bar */}
            {completionPct < 100 && !editing && (
              <div className="mt-4 bg-surface-200/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-muted">Profile Completion</span>
                  <span className="text-xs font-bold text-primary">{completionPct}%</span>
                </div>
                <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatMini icon={Briefcase} label="Total Jobs" value={stats.totalJobs} />
            <StatMini icon={Users} label="Total Applicants" value={stats.totalApplicants} color="text-blue-400" bg="bg-blue-400/10" />
            <StatMini icon={UserCheck} label="Selected" value={stats.selected} color="text-emerald-400" bg="bg-emerald-400/10" />
            <StatMini icon={MessageCircle} label="In Interview" value={stats.inInterview} color="text-amber-400" bg="bg-amber-400/10" />
          </div>
        )}

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — profile info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit form */}
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-surface-100 border border-border rounded-xl p-6 space-y-5"
                >
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Edit Profile</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} icon={UserCircle} />
                    <Input label="Position / Title" value={form.position} onChange={(e) => handleChange('position', e.target.value)} icon={Award} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Company" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} icon={Building2} />
                    <Input label="Department" value={form.department} onChange={(e) => handleChange('department', e.target.value)} icon={Target} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Phone" value={form.contact} onChange={(e) => handleChange('contact', e.target.value)} icon={Phone} />
                    <Input label="Location" value={form.location} onChange={(e) => handleChange('location', e.target.value)} icon={MapPin} />
                  </div>

                  <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} icon={Linkedin} placeholder="https://linkedin.com/in/..." />

                  <Textarea label="Bio / About" value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} placeholder="Tell candidates about yourself and your hiring philosophy..." />

                  <SkillEditor skills={form.skills} onChange={(skills) => handleChange('skills', skills)} />

                  <div className="flex gap-3 pt-2">
                    <Button onClick={saveProfile} loading={saving}>
                      <Save className="w-4 h-4" /> Save Changes
                    </Button>
                    <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-surface-100 border border-border rounded-xl p-6"
                >
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Profile Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-border">
                    <div className="space-y-0.5">
                      <InfoRow icon={Mail} label="Email" value={hrData.email} />
                      <InfoRow icon={Phone} label="Phone" value={hrData.contact} />
                      <InfoRow icon={Building2} label="Company" value={hrData.companyName} />
                      <InfoRow icon={Target} label="Department" value={hrData.department} />
                    </div>
                    <div className="space-y-0.5 pt-2 md:pt-0">
                      <InfoRow icon={UserCircle} label="Position" value={hrData.position} />
                      <InfoRow icon={MapPin} label="Location" value={hrData.location} />
                      <InfoRow
                        icon={Linkedin}
                        label="LinkedIn"
                        value={hrData.linkedin ? hrData.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') : ''}
                        href={hrData.linkedin || undefined}
                      />
                      {joinedDate && <InfoRow icon={Calendar} label="Member Since" value={joinedDate} />}
                    </div>
                  </div>

                  {/* Bio */}
                  {hrData.bio && (
                    <div className="mt-5 pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">About</h3>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{hrData.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {hrData.skills?.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-border">
                      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {hrData.skills.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column — activity + quick stats */}
          <div className="space-y-6">
            {/* Recruitment Summary */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface-100 border border-border rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Recruitment Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Active Jobs</span>
                    <span className="text-sm font-bold text-text-primary">{stats.activeJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">This Week</span>
                    <span className="text-sm font-bold text-blue-400">+{stats.recentApplicants} applicants</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Rejected</span>
                    <span className="text-sm font-bold text-red-400">{stats.rejected}</span>
                  </div>

                  {/* hire rate */}
                  {stats.totalApplicants > 0 && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-text-muted">Hire Rate</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {((stats.selected / stats.totalApplicants) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-200 rounded-full overflow-hidden flex">
                        {stats.selected > 0 && (
                          <div className="h-full bg-emerald-400 rounded-l-full" style={{ width: `${(stats.selected / stats.totalApplicants) * 100}%` }} />
                        )}
                        {stats.inInterview > 0 && (
                          <div className="h-full bg-amber-400" style={{ width: `${(stats.inInterview / stats.totalApplicants) * 100}%` }} />
                        )}
                        {stats.rejected > 0 && (
                          <div className="h-full bg-red-400/60 rounded-r-full" style={{ width: `${(stats.rejected / stats.totalApplicants) * 100}%` }} />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Selected
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <span className="w-2 h-2 rounded-full bg-amber-400" /> Interview
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <span className="w-2 h-2 rounded-full bg-red-400/60" /> Rejected
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Pipeline Stage Breakdown */}
            {stats?.stages && Object.keys(stats.stages).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface-100 border border-border rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Candidates by Stage</h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.stages)
                    .sort(([, a], [, b]) => b - a)
                    .map(([stage, count]) => {
                      const maxCount = Math.max(...Object.values(stats.stages));
                      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      const isRejected = stage === 'rejected';
                      const isSelected = stage === 'final';
                      return (
                        <div key={stage} className="flex items-center gap-2.5">
                          <span className="text-[10px] font-medium text-text-muted w-16 text-right capitalize shrink-0">
                            {stage === 'final' ? 'Selected' : stage.replace('_', ' ')}
                          </span>
                          <div className="flex-1 h-5 bg-surface-200 rounded overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(pct, 6)}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded ${
                                isRejected ? 'bg-red-500/30' : isSelected ? 'bg-emerald-500/30' : 'bg-primary/25'
                              }`}
                            />
                            <span className={`absolute inset-y-0 left-2 flex items-center text-[10px] font-bold ${
                              isRejected ? 'text-red-400' : isSelected ? 'text-emerald-400' : 'text-text-primary'
                            }`}>
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface-100 border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <a href="/hr/create-job" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Create New Job</span>
                </a>
                <a href="/hr/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">View Dashboard</span>
                </a>
                {!editing && completionPct < 100 && (
                  <button onClick={startEdit} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200 transition-colors group w-full text-left">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Complete Your Profile</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default HrProfilePage;
