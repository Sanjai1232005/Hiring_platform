import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedRoute from "../components/common/ProtectedRoutes";

// Public Pages
import Home from "../pages/Home";
import LoginPage from "../pages/auth/LoginPage";
import RoleSelectionPage from "../pages/auth/RoleSelectionPage";
import NotFoundPage from "../pages/NotFoundPage";
import StudentSignupPage from "../pages/auth/StudentSignupPage";
import HrSignupPage from "../pages/auth/HrSignupPage"

// Student Pages

import StudentDashboard from "../pages/student/Dashboard";
import StudentProfile from "../pages/student/Profile";
import StudentEditProfile from "../pages/student/EditProfile";
import ApplyForJob from "../pages/student/ApplyJob";
import JobDetails from "../pages/student/JobDetails";
import PublicStudentProfile from "../pages/student/PublicStudentProfile";
import TestGate from "../pages/student/TestGate";
import TestCodeEditorPage from "../pages/student/CodeEditor";
import PostJob from "../pages/student/PostJob";

// HR Pages
import HrProfilePage from "../pages/Hr/Profile";
import CreateJobs from "../pages/Hr/CreateJob";
import HRCreateQuestion from "../pages/Hr/CreateQuestions";
import HRDashboard from "../pages/Hr/Dashboard";


function AppRoute() {
  return (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RoleSelectionPage />} />
        <Route path="/student/signup" element={<StudentSignupPage />} />
        <Route path="/hr/signup" element={<HrSignupPage />} />

      {/* ================= PUBLIC ================= */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ================= STUDENT ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/edit-profile" element={<StudentEditProfile />} />
        <Route path="/student/apply/:jobId" element={<ApplyForJob />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/student/:id" element={<PublicStudentProfile />} />

        {/* Test flow */}
        <Route path="/test/start/:token" element={<TestGate />} />
        <Route
          path="/test/:jobId/:studentId/:token"
          element={<TestCodeEditorPage />}
        />
      </Route>

      {/* ================= HR ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["hr"]}>
            <PublicLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/profile" element={<HrProfilePage />} />
        <Route path="/hr/create" element={<CreateJobs />} />
        <Route path="/hr/create-question" element={<HRCreateQuestion />} />
        <Route path="/jobs" element={<PostJob />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  );
}

export default AppRoute;
