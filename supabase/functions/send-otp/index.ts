import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const normalizedEmail = email.toLowerCase();

    // Check user exists across paginated auth users list
    let page = 1;
    const perPage = 200;
    let userExists = false;

    while (true) {
      const { data: usersPage, error: usersError } = await adminClient.auth.admin.listUsers({ page, perPage });

      if (usersError) {
        console.error("Failed to list users:", usersError);
        return new Response(JSON.stringify({ error: "Failed to validate user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const users = usersPage?.users ?? [];
      if (users.some((u) => u.email?.toLowerCase() === normalizedEmail)) {
        userExists = true;
        break;
      }

      if (users.length < perPage || page >= 50) break;
      page += 1;
    }

    if (!userExists) {
      // Return 200 silently to not leak user existence
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old codes for this email and insert new one
    await adminClient.from("otp_codes").delete().eq("email", normalizedEmail);
    const { error: insertError } = await adminClient.from("otp_codes").insert({
      email: normalizedEmail,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: "Failed to create OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Avada <hello@archbysha.com>",
        to: [email],
        subject: `Your sign-in code: ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #c9a86c; margin-bottom: 8px;">Sign in to Avada</h2>
            <p style="color: #666; margin-bottom: 24px;">Use the code below to sign in. It expires in 10 minutes.</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #1a1a1a;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    const emailResBody = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", emailResBody);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("OTP email sent successfully:", JSON.stringify(emailResBody));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
