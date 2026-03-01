import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, password } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = name ? name.split(" ")[0] : "there";
    const appOrigin = req.headers.get("origin") || "https://meta-guide-genie.lovable.app";

    const credentialsBlock = password ? `
    <div style="background:#fff8e1;border:1px solid rgba(201,165,90,0.3);border-radius:16px;padding:28px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <span style="font-size:20px;margin-right:10px;">🔐</span>
        <h2 style="font-size:16px;font-weight:800;color:#1a1a1a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
          Your Login Credentials
        </h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#666;font-weight:600;">Email:</td>
          <td style="padding:8px 0;font-size:13px;color:#1a1a1a;font-weight:700;">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#666;font-weight:600;">Password:</td>
          <td style="padding:8px 0;font-size:13px;color:#1a1a1a;font-weight:700;font-family:monospace;letter-spacing:1px;">${password}</td>
        </tr>
      </table>
      <p style="font-size:11px;color:#999;margin:12px 0 0;line-height:1.4;">
        Save these credentials. You can also use OTP login from the login page.
      </p>
    </div>` : `
    <div style="background:#fff8e1;border:1px solid rgba(201,165,90,0.3);border-radius:16px;padding:28px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <span style="font-size:20px;margin-right:10px;">🔐</span>
        <h2 style="font-size:16px;font-weight:800;color:#1a1a1a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
          Login with OTP
        </h2>
      </div>
      <p style="font-size:13px;color:#666;margin:0;line-height:1.5;">
        Use your email <strong style="color:#1a1a1a;">${email}</strong> on the login page and request an OTP.
      </p>
    </div>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:900;color:#1a1a1a;margin:0 0 8px;letter-spacing:-0.5px;">
        Welcome to Avada, ${firstName}! 🎉
      </h1>
      <p style="font-size:14px;color:#666;margin:0;line-height:1.6;">
        Your account is ready. This email contains login details only.
      </p>
    </div>

    ${credentialsBlock}

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${appOrigin}/" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#c9a55a,#e0c068);color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:14px 28px;border-radius:50px;text-decoration:none;">
        Login to Dashboard →
      </a>
    </div>

    <div style="background:#f7faf7;border:1px solid rgba(34,197,94,0.2);border-radius:16px;padding:20px 24px;margin-bottom:20px;">
      <p style="font-size:13px;color:#1f2937;margin:0;line-height:1.5;">
        Courses and books access is sent only after payment verification.
      </p>
    </div>

    <div style="background:#e8f5e9;border:1px solid rgba(76,175,80,0.2);border-radius:16px;padding:20px 28px;margin-bottom:20px;text-align:center;">
      <p style="font-size:13px;color:#333;margin:0 0 12px;line-height:1.5;">
        💬 Need help? Reach us on WhatsApp for quick support!
      </p>
      <a href="https://wa.me/919198747810" target="_blank" style="display:inline-block;background:#25D366;color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:14px 28px;border-radius:50px;text-decoration:none;">
        Chat on WhatsApp →
      </a>
    </div>

    <div style="text-align:center;padding-top:20px;border-top:1px solid #eee;">
      <p style="font-size:11px;color:#999;margin:0;">
        Questions? Reply to this email or WhatsApp us at +91 91987 47810.
      </p>
    </div>

  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Avada <hello@archbysha.com>",
        to: [email],
        subject: `Welcome to Avada, ${firstName}! Login details inside`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
