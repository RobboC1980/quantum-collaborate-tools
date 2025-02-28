
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart2,
  Users,
  Calendar,
  Settings,
  FileText,
  CheckSquare,
  Layers,
  LogOut,
} from 'lucide-react';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import ErrorBoundary from '@/components/ui/error-boundary';
import ROUTES from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: <Home size={18} />, path: ROUTES.DASHBOARD.HOME },
    { label: 'Sprints', icon: <Calendar size={18} />, path: ROUTES.DASHBOARD.SPRINTS },
    { label: 'Stories', icon: <FileText size={18} />, path: ROUTES.DASHBOARD.STORIES },
    { label: 'Tasks', icon: <CheckSquare size={18} />, path: ROUTES.DASHBOARD.TASKS },
    { label: 'Epics', icon: <Layers size={18} />, path: ROUTES.DASHBOARD.EPICS },
    { label: 'Team', icon: <Users size={18} />, path: ROUTES.DASHBOARD.TEAM },
    { label: 'Reports', icon: <BarChart2 size={18} />, path: ROUTES.DASHBOARD.REPORTS },
    { label: 'Settings', icon: <Settings size={18} />, path: ROUTES.DASHBOARD.SETTINGS },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out");
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Add padding-top to account for the fixed navbar */}
      <div className="container grid grid-cols-12 gap-6 py-8 pt-20 mt-4">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="sticky top-24 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className="block w-full"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2", 
                    location.pathname === item.path ? "bg-muted font-medium" : ""
                  )}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Log Out
              </Button>
            </div>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
