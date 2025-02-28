
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

// Types for API responses and error handling
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ApiError extends Error {
  status?: number;
  details?: any;
}

// Define table types that are available in the database
type TableName = keyof Tables;

// Generic error handling function
export const handleApiError = (error: any, fallbackMessage: string = 'An error occurred'): ApiError => {
  console.error('API Error:', error);
  
  // Create a standardized error object
  const apiError: ApiError = new Error(
    error?.message || error?.error?.message || fallbackMessage
  );
  
  // Add additional context if available
  if (error?.status) apiError.status = error.status;
  if (error?.details) apiError.details = error.details;
  
  // Display error toast (if not in a test environment)
  if (process.env.NODE_ENV !== 'test') {
    toast({
      title: 'Error',
      description: apiError.message,
      variant: 'destructive',
    });
  }
  
  return apiError;
};

// Base API methods
const apiClient = {
  /**
   * Fetch data from Supabase
   */
  async fetch<T>(tableName: TableName, options?: { 
    select?: string,
    match?: Record<string, any>,
    filters?: any[],
    order?: { column: string, ascending?: boolean },
    limit?: number, 
    single?: boolean
  }): Promise<ApiResponse<T>> {
    try {
      let query = supabase.from(tableName).select(options?.select || '*');
      
      // Apply filters
      if (options?.match) {
        query = query.match(options.match);
      }
      
      if (options?.filters) {
        options.filters.forEach(filter => {
          if (Array.isArray(filter) && filter.length >= 3) {
            query = query.filter(filter[0], filter[1], filter[2]);
          }
        });
      }
      
      // Apply ordering
      if (options?.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? true 
        });
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute query
      const response = options?.single 
        ? await query.single() 
        : await query;
        
      if (response.error) {
        throw response.error;
      }
      
      return { data: response.data as T, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `Failed to fetch data from ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Insert data into Supabase
   */
  async create<T extends Record<string, any>>(tableName: TableName, data: Partial<T>, options?: { 
    returning?: string,
    upsert?: boolean
  }): Promise<ApiResponse<T>> {
    try {
      const query = supabase.from(tableName).insert(data as any);
      
      if (options?.returning) {
        query.select(options.returning);
      }
      
      // Use upsert method if specified
      if (options?.upsert) {
        // Note: Upsert requires setting onConflict columns
        // This implementation may need to be adjusted based on your schema
        query.onConflict('id');
      }
      
      const response = await query;
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: (response.data && response.data[0] as T) || null, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `Failed to create data in ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Update data in Supabase
   */
  async update<T extends Record<string, any>>(tableName: TableName, id: string | number, data: Partial<T>, options?: { 
    returning?: string,
    match?: Record<string, any>,
    idColumn?: string
  }): Promise<ApiResponse<T>> {
    try {
      let query;
      
      if (options?.match) {
        query = supabase.from(tableName).update(data as any).match(options.match);
      } else {
        const idColumn = options?.idColumn || 'id';
        query = supabase.from(tableName).update(data as any).eq(idColumn, id);
      }
      
      if (options?.returning) {
        query.select(options.returning);
      }
      
      const response = await query;
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: (response.data && response.data[0] as T) || null, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `Failed to update data in ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Delete data from Supabase
   */
  async delete<T>(tableName: TableName, id: string | number, options?: { 
    returning?: string,
    match?: Record<string, any>,
    idColumn?: string
  }): Promise<ApiResponse<T>> {
    try {
      let query;
      
      if (options?.match) {
        query = supabase.from(tableName).delete().match(options.match);
      } else {
        const idColumn = options?.idColumn || 'id';
        query = supabase.from(tableName).delete().eq(idColumn, id);
      }
      
      if (options?.returning) {
        query.select(options.returning);
      }
      
      const response = await query;
      
      if (response.error) {
        throw response.error;
      }
      
      return { data: (response.data && response.data[0] as T) || null, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `Failed to delete data from ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Execute a custom query using Supabase functions
   */
  async executeFunction<T>(functionName: string, payload?: any): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });
      
      if (error) {
        throw error;
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `Failed to execute function ${functionName}`);
      return { data: null, error: apiError };
    }
  }
};

export default apiClient;
