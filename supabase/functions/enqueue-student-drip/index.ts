import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing configuration" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { studentId, studentEmail } = await req.json();

  if (!studentId || !studentEmail) {
    return new Response(JSON.stringify({ error: "studentId and studentEmail are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Check if already enqueued for this student
  const { data: existing } = await adminClient
    .from("email_drip_queue")
    .select("id")
    .eq("student_id", studentId)
    .limit(1);

  if (existing && existing.length > 0) {
    return new Response(
      JSON.stringify({ success: true, message: "Already enqueued" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fetch enabled templates
  const { data: templates } = await adminClient
    .from("email_drip_templates")
    .select("step_name, delay_hours")
    .eq("enabled", true);

  if (!templates || templates.length === 0) {
    return new Response(JSON.stringify({ success: true, message: "No drip templates configured yet" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const rows = templates.map((t: { step_name: string; delay_hours: number }) => ({
    student_id: studentId,
    student_email: studentEmail,
    step_name: t.step_name,
    delay_hours: t.delay_hours,
    scheduled_at: new Date(now.getTime() + t.delay_hours * 60 * 60 * 1000).toISOString(),
    status: "pending",
  }));

  const { error } = await adminClient.from("email_drip_queue").insert(rows);

  if (error) {
    console.error("Enqueue error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ success: true, enqueued: rows.length }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
