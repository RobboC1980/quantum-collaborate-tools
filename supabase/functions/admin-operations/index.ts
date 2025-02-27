
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// This is a secure server-side function, so it's safe to use the service role key here
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request has a valid JWT from an authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the JWT and verify
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token)
    
    if (verifyError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const { operation, ...params } = await req.json()
    
    // Handle different admin operations
    let result
    console.log(`Executing admin operation: ${operation}`)
    
    switch (operation) {
      case 'list_users':
        // Only allow if user has admin role
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError || profile?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
        result = { data: users, error: usersError }
        break
      
      case 'update_user_role':
        // Check if user is admin before allowing role update
        const { data: adminCheck, error: adminCheckError } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (adminCheckError || adminCheck?.role !== 'admin') {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const { userId, role } = params
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role })
          .eq('id', userId)
          .select()
        
        result = { data: updateData, error: updateError }
        break
      
      // Add more admin operations as needed
      
      default:
        return new Response(
          JSON.stringify({ error: 'Operation not supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
