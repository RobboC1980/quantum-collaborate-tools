
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
 * Hook for fetching data from the API with React Query
 */
export function useFetch<T>(
  queryKey: QueryKey,
  tableName: string,
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
    // Wrap the success callback in meta to follow TanStack Query v5 pattern
    meta: {
      ...(options?.queryOptions?.meta || {}),
      onSuccess: (data: ApiResponse<T>) => {
        if (options?.successMessage && data.data) {
          toast({
            title: 'Success',
            description: options.successMessage,
          });
        }
        
        // Call the original onSuccess if provided
        if (options?.queryOptions?.meta?.onSuccess) {
          // Type assertion to handle the function properly
          const onSuccess = options?.queryOptions?.meta?.onSuccess as unknown as 
            (data: ApiResponse<T>) => void;
          onSuccess(data);
        }
      }
    }
  });
}

/**
 * Hook for creating data in the API with React Query
 */
export function useCreate<T>(
  tableName: string,
  options?: {
    apiOptions?: Parameters<typeof apiClient.create>[2],
    mutationOptions?: Omit<UseMutationOptions<ApiResponse<T>, Error, Record<string, any>>, 'mutationFn'>,
    invalidateQueries?: QueryKey[],
    successMessage?: string,
  }
) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const mutation = useMutation<ApiResponse<T>, Error, Record<string, any>>({
    mutationFn: (data: Record<string, any>) => {
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
export function useUpdate<T>(
  tableName: string,
  options?: {
    apiOptions?: Parameters<typeof apiClient.update>[3],
    mutationOptions?: Omit<UseMutationOptions<
      ApiResponse<T>, 
      Error, 
      { id: string | number; data: Record<string, any> }
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
    { id: string | number; data: Record<string, any> }
  >({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, any> }) => {
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
export function useDelete<T>(
  tableName: string,
  options?: {
    apiOptions?: Parameters<typeof apiClient.delete>[2],
    mutationOptions?: Omit<UseMutationOptions<
      ApiResponse<T>, 
      Error, 
      string | number
    >, 'mutationFn'>,
    invalidateQueries?: QueryKey[],
    successMessage?: string,
  }
) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const mutation = useMutation<ApiResponse<T>, Error, string | number>({
    mutationFn: (id: string | number) => {
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
export function useExecuteFunction<T, P = any>(
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
