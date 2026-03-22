import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const adminEmail = "admin@triageflow.ai";
    const adminPassword = "admin";

    // Check if admin already exists by trying to sign in
    const { data: signInData, error: signInError } =
      await adminClient.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });

    if (signInData?.user) {
      return new Response(
        JSON.stringify({
          message: "Admin user already exists",
          email: adminEmail,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin user
    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { organization_name: "TriageFlow Admin" },
      });

    if (createError) {
      // If user exists but wrong password, still return success
      if (createError.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({
            message: "Admin user already exists",
            email: adminEmail,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw createError;
    }

    return new Response(
      JSON.stringify({
        message: "Admin user created successfully",
        email: adminEmail,
        password: adminPassword,
        note: "Please change this password after first login!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
