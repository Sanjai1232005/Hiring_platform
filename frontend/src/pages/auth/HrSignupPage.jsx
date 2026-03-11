import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Building2, Briefcase } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function HRSignupPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', contact: '', companyName: '', position: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(BASE_URL + '/auth/signup', { ...formData, role: 'hr' });
      setMessage('HR Registered Successfully!');
      setFormData({ name: '', email: '', password: '', contact: '', companyName: '', position: '' });
      navigate('/login');
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">SmartRecruit</span>
        </div>

        <h2 className="text-3xl font-bold text-text-primary mb-2">Create HR account</h2>
        <p className="text-text-secondary mb-8">Set up your recruiter profile.</p>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm mb-6 border ${message.includes('Successfully') ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" placeholder="Jane Smith" value={formData.name} onChange={handleChange} required icon={User} />
          <Input label="Email" name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} required icon={Mail} />
          <Input label="Password" name="password" type="password" placeholder="Min 6 chars" value={formData.password} onChange={handleChange} required icon={Lock} />
          <Input label="Contact" name="contact" placeholder="+91 9876543210" value={formData.contact} onChange={handleChange} required icon={Phone} />
          <Input label="Company Name" name="companyName" placeholder="Acme Inc." value={formData.companyName} onChange={handleChange} required icon={Building2} />
          <Input label="Position" name="position" placeholder="HR Manager" value={formData.position} onChange={handleChange} required icon={Briefcase} />

          <Button type="submit" className="w-full mt-2" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
