import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Shield, Lock, Bell, CheckCircle } from "lucide-react";

const stripePromise = loadStripe("pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB");

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
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
    console.log("[PaymentModal] Submitting setup...");

    const failSafeTimeout = window.setTimeout(() => {
      setError("Payment confirmation is taking too long. Please refresh and try again.");
      setLoading(false);
    }, 90000);

    try {
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/courses?checkout=success`,
        },
        redirect: "if_required",
      });

      console.log("[PaymentModal] confirmSetup result:", JSON.stringify({
        error: result.error?.message,
        setupIntentStatus: result.setupIntent?.status,
        setupIntentId: result.setupIntent?.id,
      }));

      if (result.error) {
        setError(result.error.message || "Payment failed");
        return;
      }

      const setupIntentStatus = result.setupIntent?.status;

      if (setupIntentStatus === "succeeded") {
        toast({ title: "Welcome aboard! 🎉", description: "Your subscription is now active." });
        await onSuccess();
        return;
      }

      if (setupIntentStatus === "requires_action") {
        await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/dashboard/courses?checkout=success`,
          },
          redirect: "always",
        });
        return;
      }

      if (setupIntentStatus === "processing") {
        toast({ title: "Processing…", description: "We’re verifying your payment method." });

        for (let retries = 0; retries < 8; retries++) {
          await new Promise((resolve) => setTimeout(resolve, 2500));

          const clientSecret = result.setupIntent?.client_secret;
          if (clientSecret) {
            const si = await stripe.retrieveSetupIntent(clientSecret);
            const latestStatus = si.setupIntent?.status;

            if (latestStatus === "succeeded") {
              toast({ title: "Welcome aboard! 🎉", description: "Your subscription is now active." });
              await onSuccess();
              return;
            }

            if (latestStatus && latestStatus !== "processing") {
              setError(`Setup failed: ${latestStatus}. Please try again.`);
              return;
            }
          }

          const { data } = await supabase.functions.invoke("check-subscription");
          if (data?.subscribed) {
            toast({ title: "Welcome aboard! 🎉", description: "Your subscription is now active." });
            await onSuccess();
            return;
          }
        }

        setError("Verification is taking longer than expected. Please refresh and check your access.");
        return;
      }

      setError(`Unexpected status: ${setupIntentStatus || "unknown"}. Please try again.`);
    } catch (err: any) {
      console.error("[PaymentModal] confirmSetup exception:", err);
      setError(err?.message || "Payment failed unexpectedly. Please try again.");
    } finally {
      window.clearTimeout(failSafeTimeout);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Pricing callout */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground">$20.00/month</p>
            <p className="text-[10px] font-medium text-muted-foreground">Full access, billed monthly</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-[52px]">
          <Bell className="h-3.5 w-3.5 text-accent flex-shrink-0" />
          <p className="text-[10px] font-bold text-muted-foreground">Cancel anytime from your dashboard with one click</p>
        </div>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
          defaultValues: {},
        }}
      />
      {error && (
        <p className="text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-lg">{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-14 btn-gold rounded-full text-white font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-gold-lg disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 animate-spin" />Processing…</>
        ) : (
          <>🚀 Subscribe Now</>
        )}
      </button>
      <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
        <Lock className="h-3 w-3" />
        <span>Secured by Stripe® · 256-bit SSL</span>
        <Shield className="h-3 w-3" />
      </div>
    </form>
  );
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      initCheckout();
    } else {
      setClientSecret(null);
      setError(null);
    }
  }, [open]);

  const initCheckout = async () => {
    setLoading(true);
    setError(null);
    setClientSecret(null); // Reset to force fresh Edge Function call
    try {
      console.log("[PaymentModal] Invoking create-checkout...");
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
      console.log("[PaymentModal] create-checkout response:", JSON.stringify(data));
      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || "Failed to initialize payment");
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("Invalid response from checkout provider.");
      }
    } catch (e: any) {
      console.error("[PaymentModal] create-checkout error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    onOpenChange(false);
    navigate("/dashboard/courses?checkout=success");
    try {
      await refreshProfile();
    } catch (e) {
      console.warn("Profile refresh after payment failed:", e);
    }
  };

  const headerContent = (
    <>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Complete Payment</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          $20/mo · Full access · Cancel anytime
        </p>
      </div>
    </>
  );

  const content = (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        {error ? (
          <>
            <p className="text-sm text-destructive font-medium text-center px-4">{error}</p>
            <button onClick={initCheckout} className="text-xs font-bold text-accent underline mt-2">Try again</button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Redirecting to secure Stripe checkout…</p>
          </>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-5 pb-8 bg-background border-accent/10">
          <DrawerHeader className="pb-3 pt-2">
            <DrawerTitle className="sr-only">Complete Payment</DrawerTitle>
            <DrawerDescription className="sr-only">Enter payment details</DrawerDescription>
            {headerContent}
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-background border-accent/10 p-6 gap-5">
        <DialogHeader className="pb-0">
          <DialogTitle className="sr-only">Complete Payment</DialogTitle>
          <DialogDescription className="sr-only">Enter payment details</DialogDescription>
          {headerContent}
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
