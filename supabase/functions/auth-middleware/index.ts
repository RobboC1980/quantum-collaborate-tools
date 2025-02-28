// Follow this pattern to use Deno's native fetch
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

serve(async (req) => {
  try {
    // Get the user's token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'No authorization header provided',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Create a Supabase client with the Auth context of the logged-in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    // Parse the request
    const url = new URL(req.url);
    const body = req.method !== 'GET' ? await req.json() : {};
    
    // Get the required permission from query parameter
    const requiredPermission = url.searchParams.get('permission');
    
    // If no permission is specified, just check if user is authenticated
    if (!requiredPermission) {
      // Get user info
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            isAuthenticated: true,
          },
          authorized: true,
          message: 'User is authenticated',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Check specific permission
    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get user roles
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id (*)
      `)
      .eq('user_id', user.id);
    
    if (userRolesError) {
      return new Response(
        JSON.stringify({
          error: 'Error fetching user roles',
          details: userRolesError,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // If no roles, user doesn't have permission
    if (!userRoles || userRoles.length === 0) {
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            isAuthenticated: true,
          },
          authorized: false,
          message: 'User has no roles assigned',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get permissions for each role
    let hasPermission = false;
    let permissionDetails = null;
    
    for (const userRole of userRoles) {
      const roleId = userRole.role_id;
      
      // Get role permissions
      const { data: rolePermissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions:permission_id (*)
        `)
        .eq('role_id', roleId);
      
      if (permissionsError) {
        continue; // Skip this role if error
      }
      
      // Check if any permission matches the required one or if the role has wildcard permission
      for (const rp of rolePermissions) {
        const permission = rp.permissions;
        
        // Wildcard check
        if (permission.id === '*' || permission.category === '*' || permission.action === '*') {
          hasPermission = true;
          permissionDetails = permission;
          break;
        }
        
        // Exact permission match
        if (permission.id === requiredPermission) {
          hasPermission = true;
          permissionDetails = permission;
          break;
        }
        
        // Check for category:action format (e.g., "project:read")
        if (requiredPermission.includes(':')) {
          const [reqCategory, reqAction] = requiredPermission.split(':');
          
          if (
            (permission.category === reqCategory && permission.action === reqAction) ||
            (permission.category === reqCategory && permission.action === 'manage')
          ) {
            hasPermission = true;
            permissionDetails = permission;
            break;
          }
        }
      }
      
      if (hasPermission) break;
    }
    
    // Return appropriate response based on permission check
    if (hasPermission) {
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            isAuthenticated: true,
          },
          authorized: true,
          message: 'User has the required permission',
          permission: permissionDetails,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            isAuthenticated: true,
          },
          authorized: false,
          message: `User lacks the required permission: ${requiredPermission}`,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}); 