// This is a new file

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Tables } from '../integrations/supabase/types';

// Define the user profile type based on the Supabase schema
type Profile = Tables<'profiles'>;

// Define the structure for our authentication state
interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;  // Added profile
  loading: boolean;
  error: Error | null;
}

// Define the type for our context
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null; data: any | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<{ error: Error | null; data: any | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null; data: Profile | null }>;
  hasPermission: (permission: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Refresh the user profile data
  const refreshProfile = async () => {
    if (!authState.user) return;
    
    const profile = await fetchProfile(authState.user.id);
    if (profile) {
      setAuthState(prev => ({
        ...prev,
        profile,
      }));
    }
  };

  // Listen for changes on auth state
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = session?.user ?? null;
          let profile: Profile | null = null;
          
          if (user) {
            profile = await fetchProfile(user.id);
          }
          
          setAuthState({
            user,
            session,
            profile,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            profile: null,
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
        
        const user = data.session?.user ?? null;
        let profile: Profile | null = null;
        
        if (user) {
          profile = await fetchProfile(user.id);
        }
        
        setAuthState({
          user,
          session: data.session,
          profile,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    initializeSession();

    // Cleanup function
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
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
      
      const profile = data.user ? await fetchProfile(data.user.id) : null;

      setAuthState({
        user: data.user,
        session: data.session,
        profile,
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
        profile: null,
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
      
      // For sign up, we may need to create a profile if it doesn't exist
      let profile: Profile | null = null;
      
      if (data.user) {
        // Check if profile exists
        profile = await fetchProfile(data.user.id);
        
        // If not, create one
        if (!profile) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                full_name: userData?.full_name || null,
                avatar_url: userData?.avatar_url || null,
                role: 'user', // Default role
              },
            ])
            .select()
            .single();
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            profile = newProfile as Profile;
          }
        }
      }

      setAuthState({
        user: data.user,
        session: data.session,
        profile,
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
  
  // Update user profile function
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!authState.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setAuthState(prev => ({
        ...prev,
        profile: data as Profile,
      }));
      
      return { data: data as Profile, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error as Error };
    }
  };

  // Check if user has a specific permission
  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!authState.user || !authState.profile) return false;

    try {
      const userRole = authState.profile.role;

      // Simple role-based permission check
      // In a real app, you might want to implement a more complex permission system
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
    updateProfile,
    hasPermission,
    refreshProfile,
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