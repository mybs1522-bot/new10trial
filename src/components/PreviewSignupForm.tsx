import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, User, Mail, ArrowRight, Shield, Lock, Users } from "lucide-react";

function useMemberCount() {
    const [count, setCount] = useState(10834);
    useEffect(() => {
        const KEY = "avada_member_count";
        const stored = localStorage.getItem(KEY);
        let current: number;
        if (stored) {
            current = parseInt(stored, 10);
            const bump = Math.random() < 0.5 ? 1 : 2;
            current += bump;
        } else {
            current = 10834;
        }
        localStorage.setItem(KEY, String(current));
        setCount(current);
    }, []);
    return count;
}

const stripePromise = loadStripe("pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB");

const CARD_STYLE = {
    base: {
        fontSize: "14px",
        color: "#0f1a14",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: "500",
        iconColor: "#6b7a72",
        "::placeholder": { color: "#a3aba6", fontWeight: "400" },
    },
    invalid: { color: "#ef4444", iconColor: "#ef4444" },
};

function InnerForm() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { markPaid } = useAuth();
    const memberCount = useMemberCount();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ full_name: "", email: "" });

    // Helper: sign out silently if card flow fails after account creation
    const signOutSilently = async () => {
        try { await supabase.auth.signOut(); } catch (_) { /* ignore */ }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        // Validate fields
        if (!form.full_name.trim()) { setError("Please enter your name"); return; }
        if (!form.email.trim() || !form.email.includes("@")) { setError("Please enter a valid email"); return; }

        // Validate card is filled (Stripe elements exist)
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            setError("Card form not loaded. Please try again.");
            return;
        }

        setLoading(true);
        setError(null);

        const password = Math.random().toString(36).slice(-8) + "ID#2024";
        let accountCreated = false;

        try {
            // Step 1: Create account (required for Stripe — server needs auth token)
            const { error: signupError } = await supabase.auth.signUp({
                email: form.email,
                password,
                options: {
                    data: {
                        full_name: form.full_name,
                        phone: "",
                        experience_level: "beginner",
                    },
                    emailRedirectTo: window.location.origin,
                },
            });

            if (signupError) {
                if (signupError.message.includes("already registered")) {
                    setError("This email is already registered. Please log in instead.");
                    setLoading(false);
                    return;
                }
                throw signupError;
            }

            // Step 2: Sign in (needed for auth token to call create-checkout)
            const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password });
            if (signInError) throw signInError;
            accountCreated = true;

            // Step 3: Create Stripe subscription (returns a SetupIntent client secret)
            const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
            if (fnError || data?.error) {
                // Card-less access NOT allowed — sign out
                await signOutSilently();
                setError(data?.error || fnError?.message || "Failed to create subscription.");
                setLoading(false);
                return;
            }

            // Step 4: Confirm card with Stripe
            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(data.clientSecret, {
                payment_method: { card: cardNumberElement },
            });

            if (stripeError) {
                // Card declined / invalid — sign out the user
                await signOutSilently();
                setError(stripeError.message || "Card verification failed. Please try again.");
                setLoading(false);
                return;
            }

            const setupStatus = setupIntent?.status;

            if (setupStatus === "succeeded") {
                // Step 5: Verify Stripe subscription is active before granting access
                for (let i = 0; i < 6; i++) {
                    if (i > 0) await new Promise(r => setTimeout(r, 2000));
                    const { data: subData } = await supabase.functions.invoke("check-subscription");
                    if (subData?.subscribed) {
                        // Send welcome email (non-blocking)
                        supabase.functions.invoke("send-welcome-email", {
                            body: { email: form.email, name: form.full_name, password },
                        }).catch(() => { });
                        toast({ title: "Welcome aboard!", description: "Your 3-day free trial has started." });
                        markPaid({ full_name: form.full_name, phone: "" });
                        navigate("/dashboard");
                        return;
                    }
                }
                // After 6 retries, subscription still not confirmed — do NOT grant access
                await signOutSilently();
                setError("Payment was processed but subscription setup took too long. Please try again or contact support.");
                return;
            }

            if (setupStatus === "processing") {
                // Wait for processing to complete
                for (let i = 0; i < 8; i++) {
                    await new Promise(r => setTimeout(r, 2500));
                    const { data: retryData } = await supabase.functions.invoke("check-subscription");
                    if (retryData?.subscribed) {
                        supabase.functions.invoke("send-welcome-email", {
                            body: { email: form.email, name: form.full_name, password },
                        }).catch(() => { });
                        toast({ title: "Welcome aboard!", description: "Your 3-day free trial has started." });
                        markPaid({ full_name: form.full_name, phone: "" });
                        navigate("/dashboard");
                        return;
                    }
                }
                await signOutSilently();
                setError("Payment is still processing. Please try again in a few minutes.");
                return;
            }

            // Unknown status — do NOT grant access
            await signOutSilently();
            setError(`Unexpected status: ${setupStatus}. Please try again.`);
        } catch (err: any) {
            // Any unexpected error — sign out if account was created
            if (accountCreated) await signOutSilently();
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Community indicator */}
            <div className="flex items-center justify-center gap-3 mb-5 py-2 px-4 rounded-full bg-accent/[0.04] border border-accent/10">
                <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-accent/60" />
                    <span className="text-[11px] font-semibold text-foreground/70">{memberCount.toLocaleString()}+ members</span>
                </div>
                <span className="text-muted-foreground/30 text-[10px]">·</span>
                <span className="text-[11px] font-semibold text-foreground/70">$10/mo</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                    <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-1.5">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                            placeholder="Your full name"
                            required
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/40 bg-muted/20 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-1.5">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="you@email.com"
                            required
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/40 bg-muted/20 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                        />
                    </div>
                </div>

                {/* Card — single-line premium layout */}
                <div>
                    <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-1.5">Card</label>
                    <div className="rounded-xl border border-border/40 bg-muted/20 overflow-hidden transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20">
                        <div className="flex items-center">
                            {/* Card Number — takes most space */}
                            <div className="flex-1 px-3.5 py-3">
                                <CardNumberElement options={{ style: CARD_STYLE, showIcon: true }} />
                            </div>
                            {/* Divider */}
                            <div className="w-px h-6 bg-border/30" />
                            {/* Expiry */}
                            <div className="w-[80px] px-2.5 py-3">
                                <CardExpiryElement options={{ style: CARD_STYLE }} />
                            </div>
                            {/* Divider */}
                            <div className="w-px h-6 bg-border/30" />
                            {/* CVC */}
                            <div className="w-[52px] px-3 py-3">
                                <CardCvcElement options={{ style: CARD_STYLE }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing callout */}
                <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-accent/[0.04] border border-accent/10">
                    <div>
                        <p className="text-[11px] font-bold text-foreground">3-day free trial</p>
                        <p className="text-[10px] text-muted-foreground">then $10/mo · cancel anytime</p>
                    </div>
                    <span className="text-lg font-black text-accent">$0</span>
                </div>

                {error && (
                    <p className="text-xs text-destructive font-medium bg-destructive/5 p-3 rounded-xl">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="w-full h-12 btn-primary rounded-xl text-white font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-green-lg disabled:opacity-60"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" />Setting up your trial...</>
                    ) : (
                        <>Start Free Now <ArrowRight className="h-4 w-4" /></>
                    )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.06em]">
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Encrypted</span>
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Cancel anytime</span>
                </div>
            </form>
        </div>
    );
}

export function PreviewSignupForm() {
    return (
        <Elements stripe={stripePromise}>
            <InnerForm />
        </Elements>
    );
}
