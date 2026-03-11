import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';

const DashboardLayout = ({ role }) => {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role={role} />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
