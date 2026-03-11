import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent } from '../../services/auth.service';
import uploadToCloudinary from '../../services/cloudinary.service';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Mail, Lock, Phone, MapPin, GraduationCap, Upload } from 'lucide-react';

const StudentSignupPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', location: '',
    college: '', degree: '', branch: '', graduationYear: '',
    skills: '', about: '',
    socialLinks: { linkedin: '', github: '', portfolio: '' },
  });
  const [files, setFiles] = useState({ profilePhoto: null, resume: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const key = name.split('.')[1];
      setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e, type) => {
    setFiles({ ...files, [type]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const [profilePhotoUrl, resumeUrl] = await Promise.all([
        files.profilePhoto ? uploadToCloudinary(files.profilePhoto, 'image') : '',
        files.resume ? uploadToCloudinary(files.resume, 'raw') : '',
      ]);
      const payload = {
        ...form, role: 'student',
        profilePhoto: profilePhotoUrl, resume: resumeUrl,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()) : [],
      };
      await registerStudent(payload);
      setMessage({ type: 'success', text: 'Registration successful!' });
      navigate('/login');
    } catch (err) {
      setMessage({ type: 'error', text: 'Signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">SmartRecruit</span>
        </div>

        <h2 className="text-3xl font-bold text-text-primary mb-2">Create student account</h2>
        <p className="text-text-secondary mb-8">Fill in your details to get started.</p>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm mb-6 border ${message.type === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="name" placeholder="John Doe" onChange={handleChange} required icon={User} />
            <Input label="Email" name="email" type="email" placeholder="you@email.com" onChange={handleChange} required icon={Mail} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Password" name="password" type="password" placeholder="Min 6 chars" onChange={handleChange} required icon={Lock} />
            <Input label="Phone" name="phone" placeholder="+91 9876543210" onChange={handleChange} icon={Phone} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Location" name="location" placeholder="Mumbai, India" onChange={handleChange} icon={MapPin} />
            <Input label="College" name="college" placeholder="IIT Bombay" onChange={handleChange} icon={GraduationCap} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Degree" name="degree" placeholder="B.Tech" onChange={handleChange} />
            <Input label="Branch" name="branch" placeholder="CSE" onChange={handleChange} />
            <Input label="Grad Year" name="graduationYear" type="number" placeholder="2025" onChange={handleChange} />
          </div>
          <Input label="Skills (comma separated)" name="skills" placeholder="React, Node.js, Python" onChange={handleChange} />
          <Textarea label="About" name="about" placeholder="Brief intro about yourself..." rows={3} onChange={handleChange} />

          <div className="border-t border-border pt-4 mt-2">
            <p className="text-sm font-medium text-text-secondary mb-3">Social Links</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="LinkedIn" name="socialLinks.linkedin" placeholder="URL" onChange={handleChange} />
              <Input label="GitHub" name="socialLinks.github" placeholder="URL" onChange={handleChange} />
              <Input label="Portfolio" name="socialLinks.portfolio" placeholder="URL" onChange={handleChange} />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Profile Photo</label>
              <label className="flex items-center gap-2 px-4 py-3 bg-surface-100 border border-border rounded-lg cursor-pointer hover:border-border-light transition-colors text-sm text-text-muted">
                <Upload className="w-4 h-4" />
                {files.profilePhoto ? files.profilePhoto.name : 'Choose image'}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePhoto')} className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Resume (PDF)</label>
              <label className="flex items-center gap-2 px-4 py-3 bg-surface-100 border border-border rounded-lg cursor-pointer hover:border-border-light transition-colors text-sm text-text-muted">
                <Upload className="w-4 h-4" />
                {files.resume ? files.resume.name : 'Choose PDF'}
                <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'resume')} className="hidden" />
              </label>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-4" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentSignupPage;
