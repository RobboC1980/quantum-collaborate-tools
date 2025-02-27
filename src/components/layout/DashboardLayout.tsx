
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { label: 'Dashboard', icon: <Home size={18} />, path: '/dashboard' },
    { label: 'Sprints', icon: <Calendar size={18} />, path: '/dashboard/sprints' },
    { label: 'Stories', icon: <FileText size={18} />, path: '/dashboard/stories' },
    { label: 'Tasks', icon: <CheckSquare size={18} />, path: '/dashboard/tasks' },
    { label: 'Epics', icon: <Layers size={18} />, path: '/dashboard/epics' },
    { label: 'Team', icon: <Users size={18} />, path: '/dashboard/team' },
    { label: 'Reports', icon: <BarChart2 size={18} />, path: '/dashboard/reports' },
    { label: 'Settings', icon: <Settings size={18} />, path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container grid grid-cols-12 gap-6 py-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="sticky top-20 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2", 
                  location.pathname === item.path ? "bg-muted font-medium" : ""
                )}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
