import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find admin user
    const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers();
    if (listErr) throw listErr;

    const adminUser = users?.find(u => u.email === "admin@triageflow.ai");
    if (!adminUser) {
      return new Response(JSON.stringify({ error: "Admin user not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404,
      });
    }

    // Update password
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(adminUser.id, {
      password: "admin1",
    });
    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ message: "Admin password updated to admin1" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
