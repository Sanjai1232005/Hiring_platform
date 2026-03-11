import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopHeader from '../components/navigation/TopHeader';

const DashboardLayout = ({ role }) => {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
