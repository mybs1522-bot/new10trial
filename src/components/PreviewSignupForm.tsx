import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

export function PreviewSignupForm() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const memberCount = useMemberCount();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ full_name: "", email: "", password: "" });

    const signOutSilently = async () => {
        try { await supabase.auth.signOut(); } catch (_) { /* ignore */ }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate fields
        if (!form.full_name.trim()) { setError("Please enter your name"); return; }
        if (!form.email.trim() || !form.email.includes("@")) { setError("Please enter a valid email"); return; }
        if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

        setLoading(true);
        setError(null);

        const password = form.password;
        let accountCreated = false;

        try {
            // Step 1: Create account
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
                if (signupError.message.includes("already registered") || signupError.message.includes("already exists")) {
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

            try {
                if (typeof window !== "undefined" && (window as any).fbq) {
                    (window as any).fbq('track', 'CompleteRegistration');
                }
            } catch (e) {
                console.error("FB Pixel error", e);
            }

            // Step 3: Create Stripe Checkout Session
            try {
                if (typeof window !== "undefined" && (window as any).fbq) {
                    (window as any).fbq('track', 'InitiateCheckout');
                }
            } catch (e) {}

            const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
            if (fnError || data?.error) {
                await signOutSilently();
                setError(data?.error || fnError?.message || "Failed to initiate checkout.");
                setLoading(false);
                return;
            }

            // Step 4: Redirect to the hosted checkout page
            if (data?.url) {
                // Send welcome email (wait for request to fire off, but catch errors silently)
                await supabase.functions.invoke("send-welcome-email", {
                    body: { email: form.email, name: form.full_name, password },
                }).catch(() => { });
                window.location.href = data.url;
            } else {
                await signOutSilently();
                setError("Invalid response from checkout provider.");
            }
        } catch (err: any) {
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

            <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* Password */}
                <div>
                    <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-1.5">Create Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="Min. 6 characters"
                            required
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/40 bg-muted/20 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                        />
                    </div>
                </div>

                {/* Pricing callout */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-accent/[0.04] border border-accent/10 mt-2">
                    <div>
                        <p className="text-[11px] font-bold text-foreground">Start Free Trial</p>
                        <p className="text-[10px] text-muted-foreground">then $10/mo · cancel anytime</p>
                    </div>
                    <span className="text-lg font-black text-accent">$0</span>
                </div>

                {error && (
                    <p className="text-xs text-destructive font-medium bg-destructive/5 p-3 rounded-xl">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 btn-primary rounded-xl text-white font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-green-lg disabled:opacity-60"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" />Redirecting...</>
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
