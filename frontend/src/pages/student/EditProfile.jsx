import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import API from '../../apiConfig';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PageWrapper } from '../../components/animations/pageTransition';
import { Spinner } from '../../components/ui/Loader';

const EditProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API + '/students/getProfile', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setStudent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/students/updateProfile', student, {
        headers: { Authorization: 'Bearer ' + token },
      });
      navigate('/student/profile');
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!student) return <p className="text-text-secondary py-10">No profile data found.</p>;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Edit Profile</h1>
          <p className="text-text-secondary mt-1">Update your information below.</p>
        </div>

        <div className="bg-surface-100 border border-border rounded-lg p-6 space-y-4">
          <Input label="Name" name="name" value={student.name || ''} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={student.email || ''} onChange={handleChange} />
          <Input label="Phone" name="phone" value={student.phone || ''} onChange={handleChange} />
          <Input label="Location" name="location" value={student.location || ''} onChange={handleChange} />
          <Textarea label="About" name="about" value={student.about || ''} onChange={handleChange} rows={4} />

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSubmit} loading={saving} icon={Save}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={() => navigate('/student/profile')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditProfile;
