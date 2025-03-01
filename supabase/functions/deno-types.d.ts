// Type definitions for Deno and Supabase Edge Functions

// Deno namespace
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;

  export interface ConnInfo {
    readonly localAddr: Deno.NetAddr;
    readonly remoteAddr: Deno.NetAddr;
  }

  export interface NetAddr {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  }

  export interface RequestEvent {
    readonly request: Request;
    readonly respondWith: (r: Response | Promise<Response>) => Promise<void>;
  }

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    handler?: (request: Request, connInfo: ConnInfo) => Response | Promise<Response>;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (request: Request, connInfo: ConnInfo) => Response | Promise<Response>,
    options?: ServeOptions,
  ): void;

  export function serve(options: ServeOptions): void;
}

// Supabase types
declare namespace Supabase {
  interface Profile {
    id: string;
    updated_at?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    website?: string;
    role_id?: string;
    roles?: Role;
  }

  interface Role {
    id: string;
    name: string;
    description?: string;
    is_default: boolean;
    is_system: boolean;
    permissions?: Permission[];
  }

  interface Permission {
    id: string;
    name: string;
    description?: string;
  }

  interface RolePermission {
    role_id: string;
    permission_id: string;
  }

  interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description?: string;
  }
}

// Declare global fetch for Deno
declare const fetch: typeof globalThis.fetch; 