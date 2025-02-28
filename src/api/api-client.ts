import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';

// Types for API responses and error handling
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ApiError extends Error {
  status?: number;
  details?: any;
}

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
  async fetch<T = any>(
    tableName: 'profiles', 
    options?: { 
      select?: string,
      match?: Record<string, any>,
      filters?: Array<[string, string, any]>,
      order?: { column: string, ascending?: boolean },
      limit?: number, 
      single?: boolean
    }
  ): Promise<ApiResponse<T>> {
    try {
      let query = supabase.from(tableName).select(options?.select || '*');
      
      // Apply filters
      if (options?.match) {
        query = query.match(options.match);
      }
      
      if (options?.filters) {
        options.filters.forEach(filter => {
          if (Array.isArray(filter) && filter.length >= 3) {
            const [column, operator, value] = filter;
            // We need to do this type casting because TypeScript can't infer
            // that filter will be the correct structure
            if (operator === 'eq') query = query.eq(column, value);
            else if (operator === 'neq') query = query.neq(column, value);
            else if (operator === 'gt') query = query.gt(column, value);
            else if (operator === 'gte') query = query.gte(column, value);
            else if (operator === 'lt') query = query.lt(column, value);
            else if (operator === 'lte') query = query.lte(column, value);
            else if (operator === 'like') query = query.like(column, value);
            else if (operator === 'ilike') query = query.ilike(column, value);
            else if (operator === 'is') query = query.is(column, value);
            else if (operator === 'in') query = query.in(column, value);
            else console.warn(`Unsupported operator: ${operator}`);
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
      let result;
      if (options?.single) {
        result = await query.single();
      } else {
        result = await query;
      }
      
      if (result.error) {
        throw result.error;
      }
      
      return { data: result.data as T, error: null };
    } catch (error) {
      const apiError = handleApiError(error, `Failed to fetch data from ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Insert data into Supabase
   */
  async create<T = any>(
    tableName: 'profiles', 
    data: { avatar_url?: string; full_name?: string; id: string; role?: string; }, 
    options?: { 
      returning?: string,
    }
  ): Promise<ApiResponse<T>> {
    try {
      // Start with basic insert
      let query = supabase.from(tableName).insert(data);
      
      // Handle returning fields if specified
      if (options?.returning) {
        // Use type assertion to handle the PostgrestBuilder types correctly
        const result = await query.select(options.returning);
        
        if (result.error) {
          throw result.error;
        }
        
        return {
          data: result.data as T,
          error: null
        };
      } else {
        // Execute without select
        const result = await query;
        
        if (result.error) {
          throw result.error;
        }
        
        return {
          data: result.data as T,
          error: null
        };
      }
    } catch (error) {
      const apiError = handleApiError(error, `Failed to create data in ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Update data in Supabase
   */
  async update<T = any>(
    tableName: 'profiles', 
    id: string, 
    data: { avatar_url?: string; full_name?: string; role?: string; }, 
    options?: { 
      returning?: string,
      match?: Record<string, any>,
      idColumn?: string
    }
  ): Promise<ApiResponse<T>> {
    try {
      // Initialize the query
      const baseQuery = supabase.from(tableName).update(data);
      
      // Apply conditions
      let conditionedQuery;
      if (options?.match) {
        // @ts-ignore - Bypass excessive type instantiation error
        conditionedQuery = baseQuery.match(options.match);
      } else {
        const idColumn = options?.idColumn || 'id';
        // @ts-ignore - Bypass excessive type instantiation error
        conditionedQuery = baseQuery.eq(idColumn, id);
      }
      
      // Handle returning fields if specified
      if (options?.returning) {
        // @ts-ignore - Bypass excessive type instantiation error
        const result = await conditionedQuery.select(options.returning);
        
        if (result.error) {
          throw result.error;
        }
        
        return {
          data: result.data as T,
          error: null
        };
      } else {
        // @ts-ignore - Bypass excessive type instantiation error
        const result = await conditionedQuery;
        
        if (result.error) {
          throw result.error;
        }
        
        return {
          data: result.data as T,
          error: null
        };
      }
    } catch (error) {
      const apiError = handleApiError(error, `Failed to update data in ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Delete data from Supabase
   */
  async delete<T = any>(
    tableName: 'profiles', 
    id: string, 
    options?: { 
      returning?: string,
      match?: Record<string, any>,
      idColumn?: string
    }
  ): Promise<ApiResponse<T>> {
    try {
      // Initialize the delete query
      const baseQuery = supabase.from(tableName).delete();
      
      // Apply conditions
      let conditionedQuery;
      if (options?.match) {
        // @ts-ignore - Bypass excessive type instantiation error
        conditionedQuery = baseQuery.match(options.match);
      } else {
        const idColumn = options?.idColumn || 'id';
        // @ts-ignore - Bypass excessive type instantiation error
        conditionedQuery = baseQuery.eq(idColumn, id);
      }
      
      // Handle returning fields if specified
      if (options?.returning) {
        // @ts-ignore - Bypass excessive type instantiation error
        const result = await conditionedQuery.select(options.returning);
        
        if (result.error) {
          throw result.error;
        }
        
        return {
          data: result.data as T,
          error: null
        };
      } else {
        // @ts-ignore - Bypass excessive type instantiation error
        const result = await conditionedQuery;
        
        if (result.error) {
          throw result.error;
        }
        
        return {
          data: result.data as T,
          error: null
        };
      }
    } catch (error) {
      const apiError = handleApiError(error, `Failed to delete data from ${tableName}`);
      return { data: null, error: apiError };
    }
  },
  
  /**
   * Execute a custom query using Supabase functions
   */
  async executeFunction<T = any>(functionName: string, payload?: any): Promise<ApiResponse<T>> {
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
