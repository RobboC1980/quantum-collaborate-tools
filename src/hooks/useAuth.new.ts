// This is a new file

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

// Define the structure for our authentication state
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

// Define the type for our context
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  };

  // Example function to check if user has a specific permission
  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!authState.user) return false;
    
    // This is a placeholder - replace with your actual permission checking logic
    try {
      // Example: Fetch user roles from your database and check permissions
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', authState.user.id);
      
      if (error) throw error;
      
      // Mock permission check logic - replace with your actual implementation
      return data.length > 0;
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
