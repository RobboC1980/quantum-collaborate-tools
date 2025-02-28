// Type definitions for Deno
// Needed for Supabase Edge Functions

declare namespace Deno {
  // Environment variables interface
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  }

  // Deno environment variable access
  export const env: Env;
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