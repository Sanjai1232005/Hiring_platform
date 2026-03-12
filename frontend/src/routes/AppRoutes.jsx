import { Routes, Route } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoutes';

// Public Pages
import Home from '../pages/Home';
import LoginPage from '../pages/auth/LoginPage';
import RoleSelectionPage from '../pages/auth/RoleSelectionPage';
import NotFoundPage from '../pages/NotFoundPage';
import StudentSignupPage from '../pages/auth/StudentSignupPage';
import HrSignupPage from '../pages/auth/HrSignupPage';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentProfile from '../pages/student/Profile';
import StudentEditProfile from '../pages/student/EditProfile';
import ApplyForJob from '../pages/student/ApplyJob';
import JobDetails from '../pages/student/JobDetails';
import PublicStudentProfile from '../pages/student/PublicStudentProfile';
import TestGate from '../pages/student/TestGate';
import TestCodeEditorPage from '../pages/student/CodeEditor';
import PostJob from '../pages/student/PostJob';
import StudentTaskAssessment from '../pages/student/TaskAssessment';
import StudentTaskList from '../pages/student/TaskList';
import MyInterviews from '../pages/student/MyInterviews';

// HR Pages
import HrProfilePage from '../pages/Hr/Profile';
import CreateJobs from '../pages/Hr/CreateJob';
import HRCreateQuestion from '../pages/Hr/CreateQuestions';
import HRDashboard from '../pages/Hr/Dashboard';
import TaskAssessmentPage from '../pages/Hr/TaskAssessmentPage';
import HRTaskDashboard from '../pages/Hr/HRTaskDashboard';
import CandidateReviewPanel from '../pages/Hr/CandidateReviewPanel';
import InterviewManager from '../pages/Hr/InterviewManager';
import TeamFormingPage from '../pages/Hr/TeamFormingPage';
import TeamPerformancePage from '../pages/Hr/TeamPerformancePage';
import RoleInsightsPage from '../pages/Hr/RoleInsightsPage';
import MyRoleDNA from '../pages/student/MyRoleDNA';

function AppRoute() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Home />} />

      {/* ================= AUTH (with AuthLayout branding) ================= */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RoleSelectionPage />} />
        <Route path="/student/signup" element={<StudentSignupPage />} />
        <Route path="/hr/signup" element={<HrSignupPage />} />
      </Route>

      {/* ================= STUDENT (with Sidebar) ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/edit-profile" element={<StudentEditProfile />} />
        <Route path="/student/apply/:jobId" element={<ApplyForJob />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/jobs" element={<PostJob />} />
        <Route path="/student/:id" element={<PublicStudentProfile />} />
        <Route path="/student/task-assessment/:jobId" element={<StudentTaskAssessment />} />
        <Route path="/student/task-assessment" element={<StudentTaskList />} />
        <Route path="/student/interviews" element={<MyInterviews />} />
        <Route path="/student/role-dna" element={<MyRoleDNA />} />
      </Route>

      {/* ================= TEST (full-screen, no sidebar) ================= */}
      <Route path="/test/start/:token" element={<TestGate />} />
      <Route path="/students/:jobId/:userId" element={<TestCodeEditorPage />} />

      {/* ================= HR (with Sidebar) ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <DashboardLayout role="hr" />
          </ProtectedRoute>
        }
      >
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/profile" element={<HrProfilePage />} />
        <Route path="/hr/create" element={<CreateJobs />} />
        <Route path="/hr/create-question" element={<HRCreateQuestion />} />
        <Route path="/hr/task-assessment" element={<TaskAssessmentPage />} />
        <Route path="/hr/task-results" element={<HRTaskDashboard />} />
        <Route path="/hr/candidate-review" element={<CandidateReviewPanel />} />
        <Route path="/hr/interviews" element={<InterviewManager />} />
        <Route path="/hr/team-forming" element={<TeamFormingPage />} />
        <Route path="/hr/team-performance" element={<TeamPerformancePage />} />
        <Route path="/hr/role-insights" element={<RoleInsightsPage />} />
        <Route path="/hr/jobs" element={<PostJob />} />
        <Route path="/hr/jobs/:id" element={<JobDetails />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoute;
