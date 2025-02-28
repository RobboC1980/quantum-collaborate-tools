
import { useState } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryKey, 
  UseQueryOptions, 
  UseMutationOptions 
} from '@tanstack/react-query';
import apiClient, { ApiResponse } from '@/api/api-client';
import { toast } from '@/components/ui/use-toast';

/**
 * Type for the profile data
 */
export type ProfileData = {
  id: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Hook for fetching data from the API with React Query
 */
export function useFetch<T = any>(
  queryKey: QueryKey,
  tableName: 'profiles',
  options?: {
    apiOptions?: Parameters<typeof apiClient.fetch>[1],
    queryOptions?: Omit<UseQueryOptions<ApiResponse<T>, Error, ApiResponse<T>, QueryKey>, 'queryKey' | 'queryFn'>,
    successMessage?: string,
  }
) {
  return useQuery<ApiResponse<T>, Error>({
    queryKey,
    queryFn: () => apiClient.fetch<T>(tableName, options?.apiOptions),
    ...options?.queryOptions,
    onSuccess: (data) => {
      if (options?.successMessage && data.data) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      // Call the original onSuccess if provided
      if (options?.queryOptions?.onSuccess) {
        options.queryOptions.onSuccess(data);
      }
    },
  });
}

/**
 * Hook for creating data in the API with React Query
 */
export function useCreate<T = any>(
  tableName: 'profiles',
  options?: {
    apiOptions?: Parameters<typeof apiClient.create>[2],
    mutationOptions?: Omit<UseMutationOptions<
      ApiResponse<T>, 
      Error, 
      { avatar_url?: string; full_name?: string; id: string; role?: string; }
    >, 'mutationFn'>,
    invalidateQueries?: QueryKey[],
    successMessage?: string,
  }
) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const mutation = useMutation<
    ApiResponse<T>, 
    Error, 
    { avatar_url?: string; full_name?: string; id: string; role?: string; }
  >({
    mutationFn: (data) => {
      setIsLoading(true);
      return apiClient.create<T>(tableName, data, options?.apiOptions);
    },
    ...options?.mutationOptions,
    onSuccess: (data, variables, context) => {
      setIsLoading(false);
      
      // Show success toast if message provided
      if (options?.successMessage && data.data) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      setIsLoading(false);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
  });
  
  return { ...mutation, isLoading };
}

/**
 * Hook for updating data in the API with React Query
 */
export function useUpdate<T = any>(
  tableName: 'profiles',
  options?: {
    apiOptions?: Parameters<typeof apiClient.update>[3],
    mutationOptions?: Omit<UseMutationOptions<
      ApiResponse<T>, 
      Error, 
      { id: string; data: { avatar_url?: string; full_name?: string; role?: string; } }
    >, 'mutationFn'>,
    invalidateQueries?: QueryKey[],
    successMessage?: string,
  }
) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const mutation = useMutation<
    ApiResponse<T>, 
    Error, 
    { id: string; data: { avatar_url?: string; full_name?: string; role?: string; } }
  >({
    mutationFn: ({ id, data }) => {
      setIsLoading(true);
      return apiClient.update<T>(tableName, id, data, options?.apiOptions);
    },
    ...options?.mutationOptions,
    onSuccess: (data, variables, context) => {
      setIsLoading(false);
      
      // Show success toast if message provided
      if (options?.successMessage && data.data) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      setIsLoading(false);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
  });
  
  return { ...mutation, isLoading };
}

/**
 * Hook for deleting data in the API with React Query
 */
export function useDelete<T = any>(
  tableName: 'profiles',
  options?: {
    apiOptions?: Parameters<typeof apiClient.delete>[2],
    mutationOptions?: Omit<UseMutationOptions<
      ApiResponse<T>, 
      Error, 
      string
    >, 'mutationFn'>,
    invalidateQueries?: QueryKey[],
    successMessage?: string,
  }
) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const mutation = useMutation<ApiResponse<T>, Error, string>({
    mutationFn: (id) => {
      setIsLoading(true);
      return apiClient.delete<T>(tableName, id, options?.apiOptions);
    },
    ...options?.mutationOptions,
    onSuccess: (data, variables, context) => {
      setIsLoading(false);
      
      // Show success toast if message provided
      if (options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      setIsLoading(false);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
  });
  
  return { ...mutation, isLoading };
}

/**
 * Hook for executing a custom function
 */
export function useExecuteFunction<T = any, P = any>(
  functionName: string,
  options?: {
    mutationOptions?: Omit<UseMutationOptions<ApiResponse<T>, Error, P>, 'mutationFn'>,
    invalidateQueries?: QueryKey[],
    successMessage?: string,
  }
) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const mutation = useMutation<ApiResponse<T>, Error, P>({
    mutationFn: (payload: P) => {
      setIsLoading(true);
      return apiClient.executeFunction<T>(functionName, payload);
    },
    ...options?.mutationOptions,
    onSuccess: (data, variables, context) => {
      setIsLoading(false);
      
      // Show success toast if message provided
      if (options?.successMessage && data.data) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }
      
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      options?.mutationOptions?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      setIsLoading(false);
      options?.mutationOptions?.onError?.(error, variables, context);
    },
  });
  
  return { ...mutation, isLoading };
}
