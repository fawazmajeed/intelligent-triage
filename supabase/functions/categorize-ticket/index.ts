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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch org-specific categories
    const { data: orgCategories } = await supabase
      .from("org_categories")
      .select("name")
      .eq("organization_id", organization_id);

    // Fetch org-specific teams
    const { data: orgTeams } = await supabase
      .from("org_teams")
      .select("name")
      .eq("organization_id", organization_id);

    // Fetch up to 20 training examples (most recent) for few-shot context
    const { data: trainingExamples } = await supabase
      .from("org_training_examples")
      .select("description, category, team, severity")
      .eq("organization_id", organization_id)
      .order("created_at", { ascending: false })
      .limit(20);

    // Build dynamic category list
    const defaultCategories = ["Network", "Access Management", "End User Computing", "Infrastructure", "Security", "Software", "Hardware"];
    const categoryList = orgCategories && orgCategories.length > 0
      ? orgCategories.map((c) => c.name)
      : defaultCategories;

    // Build dynamic team guidance
    const teamGuidance = orgTeams && orgTeams.length > 0
      ? `Route to one of these teams: ${orgTeams.map((t) => `"${t.name}"`).join(", ")}`
      : `Suggest an appropriate team name such as "Tier 1 - Service Desk", "Tier 2 - Network Ops", "Tier 3 - Security Operations"`;

    // Build few-shot examples block
    let fewShotBlock = "";
    if (trainingExamples && trainingExamples.length > 0) {
      const examples = trainingExamples.map((ex, i) => {
        let line = `Example ${i + 1}:\n  Description: "${ex.description}"`;
        line += `\n  → Category: "${ex.category}"`;
        if (ex.team) line += `, Team: "${ex.team}"`;
        if (ex.severity) line += `, Severity: "${ex.severity}"`;
        return line;
      }).join("\n\n");
      fewShotBlock = `\n\nHere are real examples from this organization's historical tickets. Use these to understand their classification patterns:\n\n${examples}\n\nUse these examples as strong guidance for how this organization classifies tickets. Match their patterns closely.`;
    }

    const systemPrompt = `You are an expert ITIL incident triage AI. Given a raw IT incident description, analyze it and classify it accurately.

Categories (use ONLY these): ${categoryList.map((c) => `"${c}"`).join(", ")}

${teamGuidance}

Severity levels: "Critical", "High", "Medium", "Low", "Info"
Business impact levels: "Critical", "High", "Medium", "Low"

Return your classification using the categorize_incident function.${fewShotBlock}`;

    // Build enum for categories
    const categoryEnum = categoryList;

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
              description: "Categorize an IT incident with organization-specific classification",
              parameters: {
                type: "object",
                properties: {
                  category: { type: "string", enum: categoryEnum },
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
