// Follow this setup guide to integrate the Deno runtime and Supabase functions in your project:
// https://supabase.com/docs/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the auth header
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed to Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default when deployed to Supabase
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth header set from request
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the URL path
    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const endpoint = path[path.length - 1]; // Get the last segment as endpoint

    // If the endpoint is "roles"
    if (endpoint === 'roles') {
      if (req.method === 'GET') {
        // Get all roles from the database
        const { data, error } = await supabaseClient
          .from('roles')
          .select('*, permissions(*)');

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        // Create a new role
        const requestData = await req.json();
        const { name, description, isDefault, permissions } = requestData;

        // Create the role in the database
        const { data, error } = await supabaseClient
          .from('roles')
          .insert([
            {
              name,
              description,
              is_default: isDefault,
              is_system: false
            }
          ])
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Associate the permissions if provided
        if (permissions && permissions.length > 0) {
          const rolePermissions = permissions.map((permissionId: string) => ({
            role_id: data.id,
            permission_id: permissionId,
          }));

          const { error: permError } = await supabaseClient
            .from('role_permissions')
            .insert(rolePermissions);

          if (permError) {
            return new Response(
              JSON.stringify({ error: permError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Return the created role
        const role = {
          ...data,
          permissions: permissions || [],
        };

        return new Response(
          JSON.stringify(role),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If the endpoint is "permissions"
    if (endpoint === 'permissions') {
      if (req.method === 'GET') {
        // Get all permissions from the database
        const { data, error } = await supabaseClient
          .from('permissions')
          .select('*');

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle other role-related operations
    if (path.includes('roles') && path.length > 2) {
      const roleId = path[path.indexOf('roles') + 1];

      if (req.method === 'GET') {
        // Get a role by ID
        const { data, error } = await supabaseClient
          .from('roles')
          .select('*, permissions(*)')
          .eq('id', roleId)
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'PUT') {
        // Update a role
        const requestData = await req.json();
        const { name, description, isDefault, permissions } = requestData;
        
        // Update the role in the database
        const { data, error } = await supabaseClient
          .from('roles')
          .update({
            name,
            description,
            is_default: isDefault,
          })
          .eq('id', roleId)
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update the permissions if provided
        if (permissions && permissions.length > 0) {
          // First delete existing permissions
          const { error: deleteError } = await supabaseClient
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId);

          if (deleteError) {
            return new Response(
              JSON.stringify({ error: deleteError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Then add the new permissions
          const rolePermissions = permissions.map((permissionId: string) => ({
            role_id: roleId,
            permission_id: permissionId,
          }));

          const { error: insertError } = await supabaseClient
            .from('role_permissions')
            .insert(rolePermissions);

          if (insertError) {
            return new Response(
              JSON.stringify({ error: insertError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Return the updated role
        const role = {
          ...data,
          permissions: permissions || [],
        };

        return new Response(
          JSON.stringify(role),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'DELETE') {
        // Delete a role
        const { error } = await supabaseClient
          .from('roles')
          .delete()
          .eq('id', roleId);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If the endpoint is not found
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
