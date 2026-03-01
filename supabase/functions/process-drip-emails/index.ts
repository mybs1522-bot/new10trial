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

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing configuration" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch all pending emails that are due
  const { data: pendingEmails, error: fetchError } = await adminClient
    .from("email_drip_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString());

  if (fetchError) {
    console.error("Fetch error:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!pendingEmails || pendingEmails.length === 0) {
    return new Response(JSON.stringify({ success: true, processed: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fetch templates
  const { data: templates } = await adminClient
    .from("email_drip_templates")
    .select("*")
    .eq("enabled", true);

  const templateMap: Record<string, { subject: string; html: string }> = {};
  for (const t of templates || []) {
    templateMap[t.step_name] = { subject: t.subject, html: t.html };
  }

  let sent = 0;
  let failed = 0;

  for (const item of pendingEmails) {
    const template = templateMap[item.step_name];
    if (!template) {
      // Mark as failed - no template found
      await adminClient
        .from("email_drip_queue")
        .update({ status: "failed" })
        .eq("id", item.id);
      failed++;
      continue;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Avada <hello@archbysha.com>",
          to: [item.student_email],
          subject: template.subject,
          html: template.html,
        }),
      });

      if (res.ok) {
        await adminClient
          .from("email_drip_queue")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", item.id);
        sent++;
      } else {
        const errData = await res.json();
        console.error("Resend error for", item.student_email, errData);
        await adminClient
          .from("email_drip_queue")
          .update({ status: "failed" })
          .eq("id", item.id);
        failed++;
      }
    } catch (err) {
      console.error("Send error:", err);
      await adminClient
        .from("email_drip_queue")
        .update({ status: "failed" })
        .eq("id", item.id);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: pendingEmails.length, sent, failed }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
