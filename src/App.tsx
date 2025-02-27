
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SprintManagement from './pages/SprintManagement';
import StoryManagement from './pages/StoryManagement';
import TaskManagement from './pages/TaskManagement';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Create a client with more robust settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 0, // Consider everything stale immediately to force refetch on navigation
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true,
    },
  },
});

function App() {
  console.log("App rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/sprints" element={
                <ProtectedRoute>
                  <SprintManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/stories" element={
                <ProtectedRoute>
                  <StoryManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/tasks" element={
                <ProtectedRoute>
                  <TaskManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/epics" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/reports" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
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
  );
}

export default App;
