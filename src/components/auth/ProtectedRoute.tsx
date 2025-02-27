
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, profile, isLoading } = useAuth();

  console.log("Protected Route:", { user: !!user, profile, isLoading, adminOnly });

  // Show a loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-600"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    console.log("No user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // If adminOnly is true, check if the user is an admin
  if (adminOnly) {
    // Check the user's role from the profile
    const isAdmin = profile?.role === 'admin';
    
    console.log("Admin check:", { isAdmin, role: profile?.role });
    
    if (!isAdmin) {
      console.log("Not admin, redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If user is authenticated and passes admin check (if required), render the children
  return <>{children}</>;
};

export default ProtectedRoute;
