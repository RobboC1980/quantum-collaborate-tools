// This is a new file

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Define the structure for our authentication state
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

// Define the type for our context
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<{ error: Error | null; data: any | null }>;
  hasPermission: (permission: string) => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Listen for changes on auth state
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    // Initialize the session
    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setAuthState({
          user: data.session?.user ?? null,
          session: data.session,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    initializeSession();

    // Cleanup function
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));

      return { data: null, error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    userData?: Record<string, any>
  ) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { data, error: null };
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));

      return { data: null, error: error as Error };
    }
  };

  // Example function to check if user has a specific permission
  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!authState.user) return false;

    // This is a placeholder - replace with your actual permission checking logic
    try {
      // Example: Fetch user roles from your database and check permissions
      // Note: You'll need to create this table or replace with your actual roles table
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authState.user.id)
        .single();

      if (error) throw error;

      // Mock permission check logic - replace with your actual implementation
      const userRole = data?.role || 'user';

      // Simple role-based permission check
      // In a real app, you would implement a more complex permission system
      if (userRole === 'admin') return true;
      if (permission === 'read' && userRole === 'user') return true;

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  // Convenience method for checking permissions
  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!authState.user) return false;
    return await checkPermission(permission);
  };

  // Create the context value object
  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    signUp,
    hasPermission,
  };

  // Properly formatted JSX
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth; 