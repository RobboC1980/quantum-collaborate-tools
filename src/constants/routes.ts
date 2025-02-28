
/**
 * Application route definitions
 * 
 * This file contains all routes used in the application to ensure consistency
 * and make it easier to update routes in the future.
 */

// Auth-related routes
export const AUTH_ROUTES = {
  LOGIN: '/auth',
  SIGNUP: '/auth?tab=signup',
  FORGOT_PASSWORD: '/auth?tab=forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  LOGOUT: '/logout',
};

// Dashboard routes
export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  SPRINTS: '/dashboard/sprints',
  STORIES: '/dashboard/stories',
  TASKS: '/dashboard/tasks',
  EPICS: '/dashboard/epics',
  TEAM: '/dashboard/team',
  REPORTS: '/dashboard/reports',
  SETTINGS: '/dashboard/settings',
};

// Admin routes
export const ADMIN_ROUTES = {
  HOME: '/admin',
  USERS: '/admin/users',
  PROJECTS: '/admin/projects',
  SETTINGS: '/admin/settings',
};

// Public routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRICING: '/pricing',
  TERMS: '/terms',
  PRIVACY: '/privacy',
};

// Create a function to check if a route is protected
export const isProtectedRoute = (path: string): boolean => {
  return (
    path.startsWith('/dashboard') ||
    path.startsWith('/admin')
  );
};

// Create a function to check if a route is admin-only
export const isAdminRoute = (path: string): boolean => {
  return path.startsWith('/admin');
};

// Create a helper to build routes with params
export const buildRoute = (
  baseRoute: string, 
  params?: Record<string, string | number | boolean>
): string => {
  if (!params) return baseRoute;
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${baseRoute}?${queryString}` : baseRoute;
};

export default {
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  ADMIN: ADMIN_ROUTES,
  PUBLIC: PUBLIC_ROUTES,
  isProtectedRoute,
  isAdminRoute,
  buildRoute,
};
