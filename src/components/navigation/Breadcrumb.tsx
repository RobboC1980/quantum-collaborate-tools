
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import ROUTES from '@/constants/routes';

interface BreadcrumbProps {
  items?: { label: string; href: string }[];
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items = [], 
  showHome = true 
}) => {
  const location = useLocation();
  
  // If no items provided, try to generate from current path
  const breadcrumbItems = items.length 
    ? items 
    : generateBreadcrumbItems(location.pathname);
  
  // Add home item if showHome is true
  const allItems = showHome 
    ? [{ label: 'Home', href: ROUTES.DASHBOARD.HOME }, ...breadcrumbItems]
    : breadcrumbItems;

  return (
    <nav className="flex items-center text-sm">
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            
            {index === 0 && showHome && (
              <Home className="h-4 w-4 mr-1" />
            )}
            
            {index === allItems.length - 1 ? (
              <span className="font-medium">{item.label}</span>
            ) : (
              <Link 
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * Generate breadcrumb items from a path
 */
function generateBreadcrumbItems(path: string): { label: string; href: string }[] {
  // Skip for home page
  if (path === '/' || path === '') {
    return [];
  }
  
  // Split the path and remove empty segments
  const segments = path.split('/').filter(Boolean);
  
  // Map path segments to readable labels
  const pathSegmentLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'sprints': 'Sprints',
    'stories': 'Stories',
    'tasks': 'Tasks',
    'epics': 'Epics',
    'team': 'Team',
    'reports': 'Reports',
    'settings': 'Settings',
    'admin': 'Admin',
    'users': 'Users',
    'projects': 'Projects',
  };
  
  // Generate breadcrumb items
  return segments.map((segment, index) => {
    // Build the href up to this segment
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Try to get a readable label, or fallback to capitalized segment
    const label = 
      pathSegmentLabels[segment] || 
      segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return { label, href };
  });
}

export default Breadcrumb;
