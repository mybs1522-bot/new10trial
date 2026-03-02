import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, ChevronDown, ArrowRight, Shield, CreditCard } from "lucide-react";
import { COUNTRY_CODES, detectCountryCode } from "@/data/countryCodes";

const stripePromise = loadStripe("pk_live_51PRJCsGGsoQTkhyv6OrT4zvnaaB5Y0MSSkTXi0ytj33oygsfW3dcu6aOFa9q3dr2mXYTCJErnFQJcOcyuDAsQd4B00lIAdclbB");

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

function InnerForm() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"details" | "card">("details");
    const [error, setError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState("+1");
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        const detected = detectCountryCode();
        const country = COUNTRY_CODES.find(c => c.code === detected);
        if (country) setCountryCode(country.dial);
    }, []);

    const selectedCountry = COUNTRY_CODES.find(c => c.dial === countryCode) || COUNTRY_CODES.find(c => c.code === "US")!;
    const filteredCountries = countrySearch.trim()
        ? COUNTRY_CODES.filter(c =>
            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
            c.dial.includes(countrySearch) ||
            c.code.toLowerCase().includes(countrySearch.toLowerCase())
        )
        : COUNTRY_CODES;

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const digits = form.phone.replace(/[^0-9]/g, "");
        if (!form.full_name.trim()) {
            setError("Please enter your name"); return;
        }
        if (!form.email.trim() || !form.email.includes("@")) {
            setError("Please enter a valid email"); return;
        }
        if (digits.length < 6 || digits.length > 15) {
            setError("Please enter a valid phone number"); return;
        }
        setError(null);
        setStep("card");
    };

    const handleCardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const fullPhone = `${countryCode} ${form.phone}`;
        const password = Math.random().toString(36).slice(-8) + "ID#2024";

        try {
            // Step 1: Create account
            const { error: signupError } = await supabase.auth.signUp({
                email: form.email,
                password,
                options: {
                    data: {
                        full_name: form.full_name,
                        phone: fullPhone,
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

            // Step 2: Auto sign in
            await supabase.auth.signInWithPassword({ email: form.email, password });

            // Step 3: Send welcome email (non-blocking)
            supabase.functions.invoke("send-welcome-email", {
                body: { email: form.email, name: form.full_name, password },
            }).catch(() => { });

            // Step 4: Create Stripe subscription
            const cardNumberElement = elements.getElement(CardNumberElement);
            if (!cardNumberElement) {
                setError("Card form not loaded. Please try again.");
                setLoading(false);
                return;
            }

            const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
            if (fnError || data?.error) {
                setError(data?.error || fnError?.message || "Failed to create subscription.");
                setLoading(false);
                return;
            }

            // Step 5: Confirm card
            const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(data.clientSecret, {
                payment_method: { card: cardNumberElement },
            });

            if (stripeError) {
                setError(stripeError.message || "Card verification failed.");
                setLoading(false);
                return;
            }

            const setupStatus = setupIntent?.status;

            if (setupStatus === "succeeded") {
                // Step 6: Verify subscription
                const { data: subData } = await supabase.functions.invoke("check-subscription");
                if (subData?.subscribed) {
                    toast({ title: "Welcome aboard!", description: "Your 3-day free trial has started." });
                    navigate("/dashboard");
                    return;
                }
                // Retry a few times
                for (let i = 0; i < 5; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    const { data: retryData } = await supabase.functions.invoke("check-subscription");
                    if (retryData?.subscribed) {
                        toast({ title: "Welcome aboard!", description: "Your 3-day free trial has started." });
                        navigate("/dashboard");
                        return;
                    }
                }
                // Still proceed to dashboard even if check-subscription is slow
                toast({ title: "Welcome!", description: "Your account is being set up. Access will be ready shortly." });
                navigate("/dashboard");
                return;
            }

            if (setupStatus === "processing") {
                for (let i = 0; i < 8; i++) {
                    const { data: retryData } = await supabase.functions.invoke("check-subscription");
                    if (retryData?.subscribed) {
                        toast({ title: "Welcome aboard!", description: "Your 3-day free trial has started." });
                        navigate("/dashboard");
                        return;
                    }
                    await new Promise(r => setTimeout(r, 2500));
                }
                setError("Payment is still processing. Please refresh in a few seconds.");
                return;
            }

            setError(`Unexpected status: ${setupStatus}. Please try again.`);
        } catch (err: any) {
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Step indicators */}
            <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${step === "details" ? "text-accent" : "text-muted-foreground/40"}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === "details" ? "bg-accent text-white" : "bg-accent/10 text-accent"}`}>1</div>
                    Your Details
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${step === "card" ? "text-accent" : "text-muted-foreground/40"}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === "card" ? "bg-accent text-white" : "bg-muted/30 text-muted-foreground"}`}>2</div>
                    Payment
                </div>
            </div>

            {step === "details" ? (
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
                                placeholder="Your full name"
                                required
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-muted/20 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="you@email.com"
                                required
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-muted/20 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Phone with country picker */}
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.08em] mb-2">Phone Number</label>
                        <div className="flex gap-2">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                                    className="h-12 px-3 rounded-xl border border-white/10 bg-muted/20 text-sm font-medium text-foreground flex items-center gap-1.5 hover:border-accent/30 transition-all min-w-[80px]"
                                >
                                    <span className="text-base">{selectedCountry.flag}</span>
                                    <span className="text-xs font-bold">{countryCode}</span>
                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                </button>
                                {showCountryPicker && (
                                    <div className="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-y-auto bg-card border border-white/10 rounded-xl shadow-2xl z-50">
                                        <div className="sticky top-0 bg-card p-2 border-b border-white/5">
                                            <input
                                                type="text"
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                placeholder="Search country..."
                                                className="w-full h-8 px-3 rounded-lg bg-muted/20 text-xs border border-white/5 focus:outline-none"
                                                autoFocus
                                            />
                                        </div>
                                        {filteredCountries.map((c) => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => { setCountryCode(c.dial); setShowCountryPicker(false); setCountrySearch(""); }}
                                                className="w-full px-3 py-2 text-left hover:bg-muted/30 flex items-center gap-2 text-xs transition-colors"
                                            >
                                                <span className="text-base">{c.flag}</span>
                                                <span className="font-medium flex-1">{c.name}</span>
                                                <span className="text-muted-foreground font-bold">{c.dial}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative flex-1">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="Phone number"
                                    required
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-muted/20 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-destructive font-medium bg-destructive/5 p-3 rounded-xl">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full h-13 py-3.5 btn-primary rounded-xl text-white font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-green-lg"
                    >
                        Continue to Payment <ArrowRight className="h-4 w-4" />
                    </button>
                </form>
            ) : (
                <form onSubmit={handleCardSubmit} className="space-y-4">
                    {/* Back to details */}
                    <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline mb-2"
                    >
                        &larr; Back to details
                    </button>

                    <div className="bg-muted/10 rounded-xl p-3 border border-white/5 mb-3">
                        <p className="text-[11px] font-bold text-foreground">{form.full_name}</p>
                        <p className="text-[10px] text-muted-foreground">{form.email} - {countryCode} {form.phone}</p>
                    </div>

                    {/* Pricing tier */}
                    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">3-Day Free Trial</span>
                            <span className="text-lg font-black text-accent">$0</span>
                        </div>
                        <div className="h-px bg-accent/10 mb-2" />
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Then after trial</span>
                            <span className="text-sm font-black text-foreground">$10<span className="text-[10px] font-bold text-muted-foreground">/month</span></span>
                        </div>
                    </div>

                    {/* Card Number */}
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.05em] mb-2">Card Number</label>
                        <div className="rounded-xl border border-white/10 bg-muted/20 px-4 py-3.5 transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20">
                            <CardNumberElement options={{ style: CARD_STYLE, showIcon: true }} />
                        </div>
                    </div>

                    {/* Expiry + CVC */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.05em] mb-2">Expiry</label>
                            <div className="rounded-xl border border-white/10 bg-muted/20 px-4 py-3.5 transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20">
                                <CardExpiryElement options={{ style: CARD_STYLE }} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.05em] mb-2">CVC</label>
                            <div className="rounded-xl border border-white/10 bg-muted/20 px-4 py-3.5 transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20">
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
                        className="w-full h-14 btn-primary rounded-xl text-white font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-green-lg disabled:opacity-60"
                    >
                        {loading ? (
                            <><Loader2 className="h-5 w-5 animate-spin" />Setting up your trial...</>
                        ) : (
                            <>Start 3-Day Free Trial <ArrowRight className="h-4 w-4" /></>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.08em]">
                        <Shield className="h-3 w-3" />
                        256-bit SSL encrypted - Cancel anytime
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground/50 leading-relaxed">
                        Free for 3 days, then $10/month. Cancel anytime from your dashboard. No hidden charges.
                    </p>
                </form>
            )}
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
