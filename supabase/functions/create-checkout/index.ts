import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_ID = "price_1T5tXMGGsoQTkhyviCvI36pG";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id },
      });
      customerId = customer.id;
    }

    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      limit: 50,
    });

    const activeSubscription = existingSubs.data.find((s) => s.status === "active");
    if (activeSubscription) {
      return new Response(JSON.stringify({ error: "You already have an active subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const customerHasPaymentMethod = !!(
      customer.invoice_settings?.default_payment_method ||
      customer.default_source
    );

    const trialSubscriptions = existingSubs.data
      .filter((s) => s.status === "trialing")
      .sort((a, b) => b.created - a.created);

    let reusableSetupIntent: { subscriptionId: string; clientSecret: string } | null = null;
    let hasActiveTrial = false;

    for (const trialSubscription of trialSubscriptions) {
      let trialHasVerifiedPaymentMethod = customerHasPaymentMethod || !!trialSubscription.default_payment_method;
      let shouldCancel = false;

      if (trialSubscription.pending_setup_intent) {
        const setupIntentId = typeof trialSubscription.pending_setup_intent === "string"
          ? trialSubscription.pending_setup_intent
          : trialSubscription.pending_setup_intent.id;
        const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

        console.log("Trial setup intent status:", trialSubscription.id, setupIntent.status);

        if (setupIntent.status === "requires_payment_method" || setupIntent.status === "requires_confirmation") {
          if (!reusableSetupIntent && setupIntent.client_secret) {
            reusableSetupIntent = {
              subscriptionId: trialSubscription.id,
              clientSecret: setupIntent.client_secret,
            };
          }
        } else if (setupIntent.status === "succeeded" || setupIntent.status === "processing") {
          trialHasVerifiedPaymentMethod = true;
        } else {
          shouldCancel = true;
        }
      } else if (!trialHasVerifiedPaymentMethod) {
        shouldCancel = true;
      }

      if (trialHasVerifiedPaymentMethod) {
        hasActiveTrial = true;
        continue;
      }

      if (reusableSetupIntent?.subscriptionId === trialSubscription.id) {
        continue;
      }

      if (shouldCancel) {
        console.log("Canceling stale trialing subscription:", trialSubscription.id);
        await stripe.subscriptions.cancel(trialSubscription.id);
      }
    }

    if (hasActiveTrial) {
      return new Response(JSON.stringify({ error: "Your trial is already active" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (reusableSetupIntent) {
      return new Response(JSON.stringify({
        subscriptionId: reusableSetupIntent.subscriptionId,
        clientSecret: reusableSetupIntent.clientSecret,
        type: "setup",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PRICE_ID }],
      trial_period_days: 3,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["pending_setup_intent"],
    });

    const setupIntent = subscription.pending_setup_intent as Stripe.SetupIntent;

    return new Response(JSON.stringify({
      subscriptionId: subscription.id,
      clientSecret: setupIntent.client_secret,
      type: "setup",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("create-checkout error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
