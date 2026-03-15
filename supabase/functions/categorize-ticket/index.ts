import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { raw_description, source_system, organization_id } = await req.json();

    if (!raw_description || !source_system || !organization_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: raw_description, source_system, organization_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert ITIL incident triage AI. Given a raw IT incident description, analyze it and return a strict JSON object with the following fields:
- category: One of "Network", "Access Management", "End User Computing", "Infrastructure", "Security", "Software", "Hardware"
- severity: One of "Critical", "High", "Medium", "Low", "Info"
- routing_group: The specific team to route to, e.g. "Tier 1 - Service Desk", "Tier 2 - Network Ops", "Tier 3 - Security Operations"
- confidence_score: A decimal between 0 and 1 representing your confidence
- business_impact: One of "Critical", "High", "Medium", "Low"

Return ONLY the JSON object, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Source: ${source_system}\nDescription: ${raw_description}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "categorize_incident",
              description: "Categorize an IT incident with ITIL classification",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: ["Network", "Access Management", "End User Computing", "Infrastructure", "Security", "Software", "Hardware"] },
                  severity: { type: "string", enum: ["Critical", "High", "Medium", "Low", "Info"] },
                  routing_group: { type: "string" },
                  confidence_score: { type: "number", minimum: 0, maximum: 1 },
                  business_impact: { type: "string", enum: ["Critical", "High", "Medium", "Low"] },
                },
                required: ["category", "severity", "routing_group", "confidence_score", "business_impact"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "categorize_incident" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const prediction = JSON.parse(toolCall.function.arguments);

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: ticket, error: dbError } = await supabase
      .from("tickets")
      .insert({
        organization_id,
        source_system,
        raw_description,
        predicted_category: prediction.category,
        predicted_severity: prediction.severity,
        predicted_team: prediction.routing_group,
        confidence_score: prediction.confidence_score,
        business_impact: prediction.business_impact,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to save ticket");
    }

    return new Response(
      JSON.stringify({ ticket, prediction }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("categorize-ticket error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
