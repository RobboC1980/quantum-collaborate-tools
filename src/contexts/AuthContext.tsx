import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{
    error: any | null;
    data: any | null;
  }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Mock user for development
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'dev@example.com',
  user_metadata: {
    full_name: 'Development User'
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString()
};

// Mock profile for development
const MOCK_PROFILE = {
  id: 'mock-user-id',
  full_name: 'Development User',
  avatar_url: 'https://ui-avatars.com/api/?name=Development+User&background=6366F1&color=fff',
  role: 'admin',
  email: 'dev@example.com'
};

// Flag to enable mock authentication (set to true for development)
const USE_MOCK_AUTH = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Set up auth state listener
  useEffect(() => {
    console.log("AuthProvider initializing");
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        if (USE_MOCK_AUTH) {
          console.log("Using mock authentication");
          // Create a mock session
          const mockSession = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            expires_at: new Date().getTime() + 3600 * 1000,
            token_type: 'bearer',
            user: MOCK_USER as User
          } as Session;
          
          setSession(mockSession);
          setUser(MOCK_USER as User);
          setProfile(MOCK_PROFILE);
          setIsLoading(false);
          return;
        }
        
        // Get the current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session:", !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (only if not using mock auth)
    if (!USE_MOCK_AUTH) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log("Auth state changed:", _event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log("Profile fetched:", data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (USE_MOCK_AUTH) {
      console.log("Mock sign in:", email);
      
      // Simulate successful sign in
      setSession({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: new Date().getTime() + 3600 * 1000,
        token_type: 'bearer',
        user: MOCK_USER as User
      } as Session);
      setUser(MOCK_USER as User);
      setProfile(MOCK_PROFILE);
      
      return { data: { user: MOCK_USER }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error signing in:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    if (USE_MOCK_AUTH) {
      console.log("Mock sign up:", email, metadata);
      
      // Simulate successful sign up
      return { data: { user: MOCK_USER }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Error signing up:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    if (USE_MOCK_AUTH) {
      console.log("Mock sign out");
      
      // Clear auth state
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return;
    }
    
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: any) => {
    if (USE_MOCK_AUTH) {
      console.log("Mock update profile:", updates);
      
      // Update mock profile
      const updatedProfile = { ...MOCK_PROFILE, ...updates };
      setProfile(updatedProfile);
      
      return { data: updatedProfile, error: null };
    }
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error };
      }

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
