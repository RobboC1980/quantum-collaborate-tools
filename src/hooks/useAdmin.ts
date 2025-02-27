
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const callAdminFunction = async (operation: string, params: any = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('You must be logged in to perform this action');
      }
      
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { operation, ...params }
      });
      
      if (error) {
        setError(error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const listUsers = async () => {
    return callAdminFunction('list_users');
  };

  const updateUserRole = async (userId: string, role: string) => {
    return callAdminFunction('update_user_role', { userId, role });
  };

  // Add more admin functions as needed

  return {
    isLoading,
    error,
    listUsers,
    updateUserRole,
  };
};
