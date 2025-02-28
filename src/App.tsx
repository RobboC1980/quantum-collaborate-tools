import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ui/error-boundary';
import ROUTES from './constants/routes';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SprintManagement from './pages/SprintManagement';
import StoryManagement from './pages/StoryManagement';
import TaskManagement from './pages/TaskManagement';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import EpicManagement from './pages/EpicManagement';

// Create a client with more robust settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 0, // Consider everything stale immediately to force refetch on navigation
      gcTime: 5 * 60 * 1000, // Garbage collection time (renamed from cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true,
    },
  },
});

function App() {
  console.log("App rendering");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <TooltipProvider>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.PUBLIC.HOME} element={<Index />} />
                <Route path={ROUTES.AUTH.LOGIN} element={<Auth />} />
                
                {/* Dashboard Routes */}
                <Route path={ROUTES.DASHBOARD.HOME} element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.DASHBOARD.SPRINTS} element={
                  <ProtectedRoute>
                    <SprintManagement />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.DASHBOARD.STORIES} element={
                  <ProtectedRoute>
                    <StoryManagement />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.DASHBOARD.TASKS} element={
                  <ProtectedRoute>
                    <TaskManagement />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path={ROUTES.ADMIN.HOME} element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Implemented routes */}
                <Route path={ROUTES.DASHBOARD.EPICS} element={<EpicManagement />} />
                
                {/* Not yet implemented routes - redirect to NotFound */}
                <Route path={ROUTES.DASHBOARD.TEAM} element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.DASHBOARD.REPORTS} element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.DASHBOARD.SETTINGS} element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                } />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
