import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURSES_LINK = "https://drive.google.com/drive/folders/1CCyv9u82HiYI8jnyULISfBoGMcbcqd9U?usp=drive_link";
const BOOKS_LINK = "https://docs.google.com/document/d/1pRBJtlofVRHgOU3vDXGpflp0cXPX58OttsoY4pq-RRg/edit?tab=t.0";

async function sendAccessEmail(email: string, fullName: string | null, appOrigin: string) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.warn("RESEND_API_KEY not configured, skipping access email");
    return;
  }

  const firstName = fullName?.trim() ? fullName.trim().split(" ")[0] : "there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:30px;">
      <h1 style="font-size:24px;font-weight:900;color:#1a1a1a;margin:0 0 8px;letter-spacing:-0.5px;">Payment verified, ${firstName}! ✅</h1>
      <p style="font-size:14px;color:#666;margin:0;line-height:1.6;">Your access is now active. Use your login email to enter your dashboard.</p>
    </div>

    <div style="background:#faf8f3;border:1px solid rgba(201,165,90,0.2);border-radius:16px;padding:28px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <span style="font-size:20px;margin-right:10px;">🎓</span>
        <h2 style="font-size:16px;font-weight:800;color:#1a1a1a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Your Courses</h2>
      </div>
      <p style="font-size:13px;color:#666;margin:0 0 16px;line-height:1.5;">AutoCAD, SketchUp, D5 Render, AI Rendering, Workflow & Client Management — all 6 courses are unlocked.</p>
      <a href="${COURSES_LINK}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#c9a55a,#e0c068);color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:14px 28px;border-radius:50px;text-decoration:none;">Access Courses →</a>
    </div>

    <div style="background:#faf8f3;border:1px solid rgba(201,165,90,0.2);border-radius:16px;padding:28px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <span style="font-size:20px;margin-right:10px;">📚</span>
        <h2 style="font-size:16px;font-weight:800;color:#1a1a1a;margin:0;text-transform:uppercase;letter-spacing:0.5px;">Your Books</h2>
      </div>
      <p style="font-size:13px;color:#666;margin:0 0 16px;line-height:1.5;">Kitchen, Washroom, Study, Bedroom, Living Room & Exteriors — 6 premium design guides ready for you.</p>
      <a href="${BOOKS_LINK}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#c9a55a,#e0c068);color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:14px 28px;border-radius:50px;text-decoration:none;">Read Books →</a>
    </div>

    <div style="text-align:center;margin-bottom:22px;">
      <a href="${appOrigin}/" target="_blank" style="display:inline-block;background:#111827;color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:14px 28px;border-radius:50px;text-decoration:none;">Login to Dashboard →</a>
    </div>

    <div style="background:#e8f5e9;border:1px solid rgba(76,175,80,0.2);border-radius:16px;padding:20px 28px;margin-bottom:20px;text-align:center;">
      <p style="font-size:13px;color:#333;margin:0 0 12px;line-height:1.5;">💬 Need help? Reach us on WhatsApp for quick support!</p>
      <a href="https://wa.me/919198747810" target="_blank" style="display:inline-block;background:#25D366;color:#fff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;padding:14px 28px;border-radius:50px;text-decoration:none;">Chat on WhatsApp →</a>
    </div>
  </div>
</body>
</html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Avada <hello@archbysha.com>",
      to: [email],
      subject: `Access unlocked, ${firstName}! Your courses & books are ready 🚀`,
      html,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.warn("Access email send failed:", errData);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { data: existingProfile } = await supabaseClient
      .from("profiles")
      .select("has_paid, has_trial, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const hadAccessBefore = Boolean(existingProfile?.has_paid || existingProfile?.has_trial);

    const stripe = new Stripe(stripeKey);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      await supabaseClient.from("profiles").update({ has_paid: false, has_trial: false }).eq("id", user.id);
      return new Response(JSON.stringify({ subscribed: false, status: null, subscription_end: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 50,
    });

    const activeSubscriptions = subscriptions.data.filter((s) => s.status === "active" && !s.cancel_at_period_end).sort((a, b) => b.created - a.created);
    const trialSubscriptions = subscriptions.data.filter((s) => s.status === "trialing" && !s.cancel_at_period_end).sort((a, b) => b.created - a.created);

    let hasAccess = false;
    let isTrial = false;
    let subscriptionEnd: string | null = null;
    let status: string | null = null;

    if (activeSubscriptions.length > 0) {
      const activeSub = activeSubscriptions[0];
      hasAccess = true;
      status = "active";
      if (activeSub.current_period_end) {
        subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
      }
    } else if (trialSubscriptions.length > 0) {
      // For trialing subscriptions, verify payment method is attached before granting access.
      const latestTrialSub = trialSubscriptions[0];

      let hasPaymentMethod = false;

      if (latestTrialSub.default_payment_method) {
        hasPaymentMethod = true;
      }

      if (!hasPaymentMethod) {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (customer.invoice_settings?.default_payment_method || customer.default_source) {
          hasPaymentMethod = true;
        }
      }

      if (!hasPaymentMethod && latestTrialSub.pending_setup_intent) {
        const setupIntentId = typeof latestTrialSub.pending_setup_intent === "string"
          ? latestTrialSub.pending_setup_intent
          : latestTrialSub.pending_setup_intent.id;
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
        if (setupIntent.status === "succeeded") {
          hasPaymentMethod = true;
        }
      }

      if (hasPaymentMethod) {
        status = "trialing";
        hasAccess = true;
        isTrial = true;
        if (latestTrialSub.current_period_end) {
          subscriptionEnd = new Date(latestTrialSub.current_period_end * 1000).toISOString();
        }
      } else {
        status = "trialing_no_payment";
        hasAccess = false;
        isTrial = false;
      }
    }

    await supabaseClient.from("profiles").update({ has_paid: hasAccess, has_trial: isTrial }).eq("id", user.id);

    const hasAccessNow = hasAccess;
    if (!hadAccessBefore && hasAccessNow) {
      const appOrigin = req.headers.get("origin") || "https://meta-guide-genie.lovable.app";
      await sendAccessEmail(user.email, existingProfile?.full_name ?? null, appOrigin);
    }

    return new Response(JSON.stringify({
      subscribed: hasAccess,
      status,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
