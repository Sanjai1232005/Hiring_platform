import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, GraduationCap, Linkedin, Github, Globe, ExternalLink } from 'lucide-react';
import API from '../../apiConfig';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { PageWrapper, StaggerList, StaggerItem } from '../../components/animations/pageTransition';

const PublicStudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await axios.get(API + '/students/getProfile/' + id);
        setStudent(res.data);
      } catch (err) {
        console.error('Public profile fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [id]);

  if (loading) return <Loader />;
  if (!student) return <div className="flex items-center justify-center min-h-screen text-text-muted">Profile not found</div>;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-surface-100 border border-border rounded-lg p-6 mb-5">
          <div className="flex items-center gap-4">
            <Avatar src={student.profilePhoto} name={student.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{student.name}</h1>
              {student.location && (
                <p className="text-text-muted flex items-center gap-1.5 mt-1 text-sm">
                  <MapPin className="w-4 h-4" /> {student.location}
                </p>
              )}
            </div>
          </div>
        </div>

        <StaggerList className="space-y-4">
          {/* Education */}
          <StaggerItem>
            <div className="bg-surface-100 border border-border rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" /> Education
              </h2>
              <p className="text-text-primary font-medium">{student.degree} - {student.branch}</p>
              <p className="text-text-muted text-sm">{student.college} ({student.graduationYear})</p>
            </div>
          </StaggerItem>

          {/* Skills */}
          {student.skills?.length > 0 && (
            <StaggerItem>
              <div className="bg-surface-100 border border-border rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-primary mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, i) => (
                    <Badge key={i} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}

          {/* About */}
          {student.about && (
            <StaggerItem>
              <div className="bg-surface-100 border border-border rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-primary mb-3">About</h2>
                <p className="text-text-secondary text-sm leading-relaxed">{student.about}</p>
              </div>
            </StaggerItem>
          )}

          {/* Projects */}
          {student.projects?.length > 0 && (
            <StaggerItem>
              <div className="bg-surface-100 border border-border rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-primary mb-3">Projects</h2>
                <div className="space-y-3">
                  {student.projects.map((p, i) => (
                    <div key={i} className="bg-surface-200 rounded-lg p-3">
                      <p className="text-text-primary font-medium">{p.title}</p>
                      <p className="text-text-muted text-sm mt-1">{p.description}</p>
                      {p.githubLink && (
                        <a href={p.githubLink} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-primary text-sm mt-2 hover:underline">
                          <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}

          {/* Social */}
          {(student.socialLinks?.linkedin || student.socialLinks?.github || student.socialLinks?.portfolio) && (
            <StaggerItem>
              <div className="bg-surface-100 border border-border rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-primary mb-3">Links</h2>
                <div className="flex gap-4">
                  {student.socialLinks.linkedin && (
                    <a href={student.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {student.socialLinks.github && (
                    <a href={student.socialLinks.github} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {student.socialLinks.portfolio && (
                    <a href={student.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerList>
      </div>
    </PageWrapper>
  );
};

export default PublicStudentProfile;
