import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, X, Plus, Trash2, Upload, User, GraduationCap,
  Briefcase, Code2, Award, Link2, FileText, ChevronDown, Camera,
} from 'lucide-react';
import API from '../../apiConfig';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { PageWrapper } from '../../components/animations/pageTransition';
import { Spinner } from '../../components/ui/Loader';
import uploadToCloudinary from '../../services/cloudinary.service';

/* ── Collapsible section ── */
const FormSection = ({ icon: Icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface-100 border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-200/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">{title}</h3>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Skill chip editor ── */
const SkillEditor = ({ skills, onChange }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !skills.includes(v)) { onChange([...skills, v]); setInput(''); }
  };
  const remove = (i) => onChange(skills.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            {s}
            <button type="button" onClick={() => remove(i)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Type a skill and press Enter..."
          className="flex-1 bg-surface-100 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add} disabled={!input.trim()}><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
};

/* ── Repeatable list editor (projects, experience, certifications) ── */
const ListEditor = ({ items, fields, onUpdate, emptyItem, addLabel }) => {
  const add = () => onUpdate([...items, { ...emptyItem }]);
  const remove = (i) => onUpdate(items.filter((_, idx) => idx !== i));
  const change = (i, key, val) => onUpdate(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="relative bg-surface-200/50 border border-border rounded-lg p-4 space-y-3">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-3 right-3 text-text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
            {fields.map((f) => (
              <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-text-muted mb-1">{f.label}</label>
                {f.multiline ? (
                  <textarea
                    value={item[f.key] || ''}
                    onChange={(e) => change(i, f.key, e.target.value)}
                    rows={2}
                    placeholder={f.placeholder || ''}
                    className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50 transition-colors"
                  />
                ) : (
                  <input
                    value={item[f.key] || ''}
                    onChange={(e) => change(i, f.key, e.target.value)}
                    placeholder={f.placeholder || ''}
                    className="w-full bg-surface-100 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
};

/* ── Main ── */
const EditProfile = () => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API + '/students/getProfile', {
          headers: { Authorization: 'Bearer ' + token },
        });
        const d = res.data;
        setForm({
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          location: d.location || '',
          about: d.about || '',
          profilePhoto: d.profilePhoto || '',
          college: d.college || '',
          degree: d.degree || '',
          branch: d.branch || '',
          graduationYear: d.graduationYear || '',
          skills: d.skills || [],
          projects: d.projects?.length ? d.projects : [],
          experience: d.experience?.length ? d.experience : [],
          certifications: d.certifications?.length ? d.certifications : [],
          socialLinks: {
            linkedin: d.socialLinks?.linkedin || '',
            github: d.socialLinks?.github || '',
            portfolio: d.socialLinks?.portfolio || '',
          },
          resume: d.resume || '',
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleSocialChange = (key, value) =>
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const url = await uploadToCloudinary(file, 'image');
      handleChange('profilePhoto', url);
    } catch (err) {
      console.error('Photo upload failed', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingResume(true);
      const url = await uploadToCloudinary(file, 'raw');
      handleChange('resume', url);
    } catch (err) {
      console.error('Resume upload failed', err);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(API + '/students/updateProfile', form, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setToast('Profile saved successfully!');
      setTimeout(() => navigate('/student/profile'), 1200);
    } catch (err) {
      console.error('Update failed', err);
      setToast('Failed to save profile');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!form) return <p className="text-text-secondary py-10">No profile data found.</p>;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Toast */}
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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Edit Profile</h1>
            <p className="text-sm text-text-muted mt-0.5">Update your profile to stand out to recruiters</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/profile')}>Cancel</Button>
            <Button size="sm" onClick={handleSubmit} loading={saving}><Save className="w-3.5 h-3.5" /> Save</Button>
          </div>
        </div>

        {/* Photo + Basic */}
        <FormSection icon={User} title="Basic Information">
          {/* Photo upload */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative group">
              <Avatar src={form.profilePhoto} name={form.name} size="lg" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {uploadingPhoto ? <Spinner size="sm" /> : <Camera className="w-5 h-5 text-white" />}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div className="text-xs text-text-muted">
              <p className="font-medium text-text-secondary">Profile Photo</p>
              <p>Click the avatar to upload</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91 98765 43210" />
            <Input label="Location" value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="City, Country" />
          </div>
          <Textarea label="About" value={form.about} onChange={(e) => handleChange('about', e.target.value)} rows={3} placeholder="Share a brief summary about yourself, your goals, and what makes you unique..." />
        </FormSection>

        {/* Education */}
        <FormSection icon={GraduationCap} title="Education">
          <div className="grid grid-cols-2 gap-4">
            <Input label="College / University" value={form.college} onChange={(e) => handleChange('college', e.target.value)} placeholder="MIT, Stanford..." />
            <Input label="Degree" value={form.degree} onChange={(e) => handleChange('degree', e.target.value)} placeholder="B.Tech, M.S..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Branch / Major" value={form.branch} onChange={(e) => handleChange('branch', e.target.value)} placeholder="Computer Science" />
            <Input label="Graduation Year" type="number" value={form.graduationYear} onChange={(e) => handleChange('graduationYear', e.target.value)} placeholder="2026" />
          </div>
        </FormSection>

        {/* Skills */}
        <FormSection icon={Code2} title="Skills">
          <SkillEditor skills={form.skills} onChange={(skills) => handleChange('skills', skills)} />
        </FormSection>

        {/* Projects */}
        <FormSection icon={Briefcase} title="Projects" defaultOpen={form.projects.length > 0}>
          <ListEditor
            items={form.projects}
            onUpdate={(projects) => handleChange('projects', projects)}
            emptyItem={{ title: '', description: '', githubLink: '' }}
            addLabel="Add Project"
            fields={[
              { key: 'title', label: 'Project Title', placeholder: 'My Awesome Project' },
              { key: 'githubLink', label: 'GitHub Link', placeholder: 'https://github.com/...' },
              { key: 'description', label: 'Description', placeholder: 'Briefly describe the project...', multiline: true, full: true },
            ]}
          />
        </FormSection>

        {/* Experience */}
        <FormSection icon={Briefcase} title="Experience" defaultOpen={form.experience.length > 0}>
          <ListEditor
            items={form.experience}
            onUpdate={(experience) => handleChange('experience', experience)}
            emptyItem={{ company: '', role: '', duration: '' }}
            addLabel="Add Experience"
            fields={[
              { key: 'role', label: 'Role / Position', placeholder: 'Software Engineer Intern' },
              { key: 'company', label: 'Company', placeholder: 'Google, Amazon...' },
              { key: 'duration', label: 'Duration', placeholder: 'Jun 2025 – Aug 2025' },
            ]}
          />
        </FormSection>

        {/* Certifications */}
        <FormSection icon={Award} title="Certifications" defaultOpen={form.certifications.length > 0}>
          <ListEditor
            items={form.certifications}
            onUpdate={(certifications) => handleChange('certifications', certifications)}
            emptyItem={{ title: '', issuer: '', year: '' }}
            addLabel="Add Certification"
            fields={[
              { key: 'title', label: 'Certification Title', placeholder: 'AWS Solutions Architect' },
              { key: 'issuer', label: 'Issued By', placeholder: 'Amazon Web Services' },
              { key: 'year', label: 'Year', placeholder: '2025' },
            ]}
          />
        </FormSection>

        {/* Links */}
        <FormSection icon={Link2} title="Links & Resume">
          <Input label="LinkedIn" value={form.socialLinks.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
          <Input label="GitHub" value={form.socialLinks.github} onChange={(e) => handleSocialChange('github', e.target.value)} placeholder="https://github.com/yourname" />
          <Input label="Portfolio" value={form.socialLinks.portfolio} onChange={(e) => handleSocialChange('portfolio', e.target.value)} placeholder="https://yourportfolio.com" />

          {/* Resume upload */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Resume</label>
            <div className="flex items-center gap-3">
              {form.resume ? (
                <a href={form.resume} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg text-xs text-accent hover:underline">
                  <FileText className="w-3.5 h-3.5" /> View Current Resume
                </a>
              ) : (
                <span className="text-xs text-text-muted">No resume uploaded</span>
              )}
              <label className="flex items-center gap-1.5 px-3 py-2 bg-surface-200 border border-border rounded-lg text-xs text-text-secondary hover:border-border-light cursor-pointer transition-colors">
                {uploadingResume ? <Spinner size="sm" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingResume ? 'Uploading...' : 'Upload New'}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
              </label>
            </div>
          </div>
        </FormSection>

        {/* Bottom save bar */}
        <div className="sticky bottom-4 bg-surface-100 border border-border rounded-xl p-4 flex items-center justify-between shadow-lg">
          <p className="text-xs text-text-muted">Make sure to save before leaving</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/profile')}>Discard</Button>
            <Button size="sm" onClick={handleSubmit} loading={saving}><Save className="w-3.5 h-3.5" /> Save Changes</Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditProfile;
