// Type definitions for Deno
// Needed for Supabase Edge Functions

declare namespace Deno {
  // Environment variables interface
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }

  // Deno environment variable access
  export const env: Env;

  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

// Declare module for Deno HTTP server
declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Declare module for Supabase client
declare module 'https://esm.sh/@supabase/supabase-js@2.29.0' {
  export * from '@supabase/supabase-js';
}

declare module 'https://esm.sh/@supabase/supabase-js@2.23.0' {
  export * from '@supabase/supabase-js';
}

// Function types for our Edge Functions
declare module 'admin-operations' {
  export interface AdminOperationRequest {
    operation: string;
    [key: string]: any;
  }
}

declare module 'auth-middleware' {
  export interface AuthUser {
    id: string;
    role: string;
    email?: string;
  }
  
  export interface AuthContext {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
  }
}

declare module 'roles-api' {
  export interface Role {
    id: string;
    name: string;
    permissions: string[];
  }
  
  export interface UserRole {
    userId: string;
    roleId: string;
  }
} 