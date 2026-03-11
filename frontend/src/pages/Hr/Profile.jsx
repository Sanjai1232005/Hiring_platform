import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Phone, Building2, UserCircle } from 'lucide-react';
import BASE_URL from '../../apiConfig';
import Loader from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import { PageWrapper } from '../../components/animations/pageTransition';

const HrProfilePage = () => {
  const [hrData, setHrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHrProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(BASE_URL + '/hr/getProfile', {
          headers: { Authorization: 'Bearer ' + token },
        });
        setHrData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHrProfile();
  }, []);

  if (loading) return <Loader />;
  if (!hrData) return <div className="flex items-center justify-center min-h-[60vh] text-text-muted">No HR data found</div>;

  const fields = [
    { icon: Mail, label: 'Email', value: hrData.email },
    { icon: Phone, label: 'Contact', value: hrData.contact },
    { icon: Building2, label: 'Company', value: hrData.companyName },
    { icon: UserCircle, label: 'Position', value: hrData.position },
  ];

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <motion.div
          className="bg-surface-100 border border-border rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center mb-6">
            <Avatar name={hrData.name} size="lg" />
            <h2 className="text-2xl font-bold text-text-primary mt-4">{hrData.name}</h2>
            <p className="text-text-muted text-sm">{hrData.position}</p>
          </div>

          <div className="space-y-4">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-200 rounded-lg flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-text-muted" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">{f.label}</p>
                  <p className="text-sm text-text-primary">{f.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default HrProfilePage;
