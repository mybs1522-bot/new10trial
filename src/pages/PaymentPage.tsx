import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, Loader2, GraduationCap, BookOpen, Briefcase,
  Calendar, Sparkles, RefreshCw, Shield, Lock, Bell, Star, Users, Zap, ArrowRight, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvergreenTimer } from "@/components/EvergreenTimer";

const stripePromise = loadStripe("pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB");

const PLAN_FEATURES = [
  { icon: GraduationCap, label: "All 6 Courses", desc: "AutoCAD, SketchUp, D5 Render, AI Rendering, Workflow & Client Management" },
  { icon: BookOpen, label: "PDF Book Library", desc: "Curated design books & references" },
  { icon: Briefcase, label: "Freelance Projects", desc: "Access to live freelance project leads" },
  { icon: Calendar, label: "Certificates", desc: "Certificate of completion included" },
];

const CARD_STYLE = {
  base: {
    fontSize: "15px",
    color: "#0f1a14",
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: "500",
    iconColor: "#6b7a72",
    "::placeholder": { color: "#a3aba6" },
  },
  invalid: { color: "#ef4444", iconColor: "#ef4444" },
};

function InlineCheckoutForm({ onSuccess }: { onSuccess: () => Promise<void> | void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const failSafeTimeout = window.setTimeout(() => {
      setError("Payment confirmation is taking too long. Please refresh and try again.");
      setLoading(false);
    }, 90000);

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        setError("Card form not loaded. Please refresh the page.");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || "Failed to create subscription. Please try again.");
        return;
      }
      const clientSecret = data.clientSecret;
      if (!clientSecret) {
        setError("Failed to create subscription. Please try again.");
        return;
      }

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            address: { country: "US" },
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        return;
      }

      const setupStatus = result.setupIntent?.status;

      if (setupStatus === "succeeded") {
        for (let retries = 0; retries < 12; retries++) {
          const { data } = await supabase.functions.invoke("check-subscription");
          if (data?.subscribed) {
            toast({ title: "Welcome aboard! 🎉", description: "Your 3-day free trial has started." });
            await onSuccess();
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        toast({ title: "Welcome aboard! 🎉", description: "Your 3-day free trial has started." });
        await onSuccess();
        return;
      }

      if (setupStatus === "processing") {
        for (let retries = 0; retries < 12; retries++) {
          const { data } = await supabase.functions.invoke("check-subscription");
          if (data?.subscribed) {
            toast({ title: "Welcome aboard! 🎉", description: "Your 3-day free trial has started." });
            await onSuccess();
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
        setError("Payment is still processing. Please refresh in a few seconds.");
        return;
      }

      setError(`Unexpected status: ${setupStatus || "unknown"}. Please try again.`);
    } catch (err: any) {
      setError(err?.message || "Payment failed unexpectedly. Please try again.");
    } finally {
      window.clearTimeout(failSafeTimeout);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.05em] mb-2">Card Number</label>
        <div className="rounded-xl border-[1.5px] border-border/40 bg-[#fafbfa] px-4 py-3.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(45,138,94,0.08)]">
          <CardNumberElement options={{ style: CARD_STYLE, showIcon: true }} />
        </div>
      </div>

      {/* Expiry + CVC side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.05em] mb-2">Expiry</label>
          <div className="rounded-xl border-[1.5px] border-border/40 bg-[#fafbfa] px-4 py-3.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(45,138,94,0.08)]">
            <CardExpiryElement options={{ style: CARD_STYLE }} />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.05em] mb-2">CVC</label>
          <div className="rounded-xl border-[1.5px] border-border/40 bg-[#fafbfa] px-4 py-3.5 transition-all focus-within:border-accent focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(45,138,94,0.08)]">
            <CardCvcElement options={{ style: CARD_STYLE }} />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium bg-destructive/5 p-3 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-14 btn-primary rounded-xl text-white font-semibold text-[13px] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-green-lg disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" />Processing…</>
        ) : (
          <>Start Free Now <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.08em]">
        <Shield className="h-3 w-3" />
        <span>256-bit SSL Encrypted · Stripe Secured</span>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async () => {
    try {
      await supabase.functions.invoke("check-subscription");
    } catch (e) {
      console.warn("Subscription sync failed before refresh:", e);
    }
    await refreshProfile();
    navigate("/dashboard/courses?checkout=success");
  };

  // Hide tawk chat widget on this page
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "hide-tawk-payment";
    style.textContent = `iframe[title*="chat"], iframe[title*="Tawk"], .widget-visible, #tawk-bubble-container, [class*="tawk"], [id*="tawk"], #tawk-tooltip-container, .tawk-min-container, iframe[src*="tawk"], div[id^="tawkchat"], .tawk-button, .tawk-custom-color, div[class*="widget-visible"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; height: 0 !important; width: 0 !important; max-height: 0 !important; max-width: 0 !important; overflow: hidden !important; }`;
    document.head.appendChild(style);
    const hideTawk = () => {
      if ((window as any).Tawk_API?.hideWidget) (window as any).Tawk_API.hideWidget();
    };
    hideTawk();
    const interval = setInterval(hideTawk, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10000);
    return () => { style.remove(); clearInterval(interval); clearTimeout(timeout); };
  }, []);

  if (profile?.has_paid || profile?.has_trial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground">You're all set!</h2>
          <p className="text-muted-foreground text-sm">You already have access to this plan.</p>
          <Button onClick={() => navigate("/dashboard/courses")} className="rounded-full btn-primary text-white border-0">
            Go to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/5 text-accent text-[10px] font-black tracking-[0.15em] uppercase px-4 py-2 rounded-full mb-4 border border-accent/15">
            <Sparkles className="h-3 w-3" /> 3-day free trial · $0 charged today
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-foreground tracking-tight">
            Start Your Free Trial
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-2.5 max-w-md mx-auto">
            Join 10,000+ designers mastering their craft. Cancel anytime.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8 items-start">

          {/* LEFT: Plan summary — ALWAYS first on mobile */}
          <div className="space-y-4 order-1 lg:order-1">

            {/* Price card */}
            <div className="rounded-2xl overflow-hidden border border-accent/15 bg-accent/[0.03]">
              <div className="p-5 sm:p-6 text-center">
                <p className="text-accent text-[10px] font-black tracking-[0.15em] uppercase mb-3">Design & AI Mastery</p>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="text-muted-foreground/40 text-lg font-medium line-through mr-1">$10</span>
                  <span className="text-accent text-3xl font-black">$0</span>
                  <span className="text-muted-foreground text-xs font-medium">today</span>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground">Then $10/mo after 3-day trial</p>
              </div>
            </div>

            {/* Weekly update highlight */}
            <div className="p-4 rounded-xl border border-accent/12 bg-accent/[0.03] flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/8 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-foreground">New Books & Courses Every Saturday</p>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Stay updated with current trends in the Design industry</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {PLAN_FEATURES.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent shadow-green">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT: Premium Card Payment Form */}
          <div className="order-2 lg:order-2 lg:sticky lg:top-6">
            <div className="rounded-2xl overflow-hidden border border-border/20 shadow-lift">

              {/* ── Card Header (clean, like a physical card) ── */}
              <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 bg-gradient-to-br from-[#f8f9f8] to-[#f0f2f0] border-b border-border/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Gold chip */}
                    <div className="w-11 h-8 rounded-md overflow-hidden flex-shrink-0" style={{ background: "linear-gradient(135deg, #c9a55a 0%, #f0d78c 30%, #c9a55a 60%, #a88a3e 100%)" }}>
                      <div className="w-full h-full" style={{ background: "repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 5px)" }} />
                    </div>
                    <p className="text-[13px] font-black text-foreground/70 uppercase tracking-[0.08em]">Pay with Card</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground/30">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">All Cards Accepted</span>
                  </div>
                </div>
              </div>

              {/* ── Card Form Body ── */}
              <div className="bg-white p-5 sm:p-7 space-y-5">

                {/* $0 callout */}
                <div className="rounded-xl border border-accent/15 bg-accent/[0.03] p-3.5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent/8 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-foreground">Your card won't be charged today</p>
                    <p className="text-[10px] font-medium text-muted-foreground">3-day free trial · Cancel anytime before it ends</p>
                  </div>
                </div>

                {/* Stripe Card Elements */}
                <Elements
                  stripe={stripePromise}
                  options={{
                    fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" }],
                  }}
                >
                  <InlineCheckoutForm onSuccess={handleSuccess} />
                </Elements>
              </div>
            </div>
          </div>

          {/* Social proof + Reminder — below card form on mobile, below left col on desktop */}
          <div className="order-3 lg:order-3 lg:col-start-1 space-y-4">
            {/* Social proof */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/60 border border-border/20">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-accent/15 border-2 border-background flex items-center justify-center">
                    <Users className="h-3 w-3 text-accent" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Loved by 10,000+ designers worldwide</p>
              </div>
            </div>

            {/* Reminder guarantee */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/[0.03] border border-accent/10">
              <Bell className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-foreground">We'll remind you before your trial ends</p>
                <p className="text-[10px] text-muted-foreground">You'll get email reminders at day 1 and day 2 — cancel with one click anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EvergreenTimer />
    </div>
  );
}
