import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { PremiumInput } from "@/components/PremiumFormComponents";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/components/PremiumFormWrapper";
import { COUNTRY_CODES, detectCountryCode } from "@/data/countryCodes";

const levels = [
  { value: "beginner", label: "Complete Beginner", emoji: "🌱" },
  { value: "some_idea", label: "Some Experience", emoji: "🎯" },
];

const INLINE_TIMER_TOTAL_SECONDS = 2 * 3600 + 27 * 60 + 32;
const INLINE_TIMER_STORAGE_KEY = "landing_inline_trial_timer_start";

function getInlineTimerTimeLeft(): number {
  let start = localStorage.getItem(INLINE_TIMER_STORAGE_KEY);
  if (!start) {
    start = String(Date.now());
    localStorage.setItem(INLINE_TIMER_STORAGE_KEY, start);
  }
  const elapsed = Math.floor((Date.now() - Number(start)) / 1000);
  return INLINE_TIMER_TOTAL_SECONDS - (elapsed % INLINE_TIMER_TOTAL_SECONDS);
}

function formatInlineTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function EnrollmentForm() {
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [timeLeft, setTimeLeft] = useState(getInlineTimerTimeLeft);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    experience_level: "beginner",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const detected = detectCountryCode();
    const country = COUNTRY_CODES.find(c => c.code === detected);
    if (country) setCountryCode(country.dial);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft(getInlineTimerTimeLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.dial === countryCode) || COUNTRY_CODES.find(c => c.code === "US")!;

  const filteredCountries = countrySearch.trim()
    ? COUNTRY_CODES.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.dial.includes(countrySearch) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    )
    : COUNTRY_CODES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = form.phone.replace(/[^0-9]/g, "");
    if (digits.length < 6 || digits.length > 15) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const fullPhone = `${countryCode} ${form.phone}`;
    const password = Math.random().toString(36).slice(-8) + "ID#2024";

    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          data: {
            full_name: form.full_name,
            phone: fullPhone,
            experience_level: form.experience_level,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Account exists", description: "Please use the login form instead.", variant: "destructive" });
          setLoading(false);
          return;
        }
        throw error;
      }

      await supabase.auth.signInWithPassword({ email: form.email, password });

      supabase.functions.invoke("send-welcome-email", {
        body: { email: form.email, name: form.full_name, password },
      }).catch((err) => console.warn("Welcome email failed:", err));

      toast({
        title: "Welcome! 🎉",
        description: "Your account has been created. Check your email for credentials.",
      });

      navigate("/dashboard");
    } catch (err: unknown) {
      toast({
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-4 pt-4"
    >
      <PremiumInput
        id="full_name"
        name="full_name"
        label="Full Name"
        placeholder="Enter your full name"
        value={form.full_name}
        onChange={handleChange}
        required
        icon={<User />}
      />

      <PremiumInput
        id="email"
        name="email"
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        value={form.email}
        onChange={handleChange}
        required
        icon={<Mail />}
      />

      <motion.div variants={itemVariants} className={`space-y-1.5 pt-1 ${showCountryPicker ? "relative z-50" : ""}`}>
        <div className="flex gap-2.5">
          <div className="relative" style={{ zIndex: showCountryPicker ? 100 : 'auto' }}>
            <button
              type="button"
              onClick={() => { setShowCountryPicker(!showCountryPicker); setCountrySearch(""); }}
              className="h-[54px] px-3.5 rounded-xl border border-border bg-background flex items-center gap-1.5 text-foreground hover:border-accent/30 transition-all min-w-[95px] shadow-sm"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-[13px] font-bold text-muted-foreground">{countryCode}</span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground/50 ml-auto transition-transform duration-200 ${showCountryPicker ? "rotate-180" : ""}`} />
            </button>

            {showCountryPicker && (
              <>
                <div className="fixed inset-0" style={{ zIndex: 90 }} onClick={() => setShowCountryPicker(false)} />
                <div className="absolute top-full left-0 mt-1.5 w-[280px] max-h-[240px] overflow-hidden rounded-xl bg-white border border-border/30 flex flex-col" style={{ zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)' }}>
                  <div className="p-2.5 border-b border-border/20 bg-secondary/30 sticky top-0">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg bg-white text-xs font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none border border-border/30 focus:border-accent/40 transition-colors"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setCountryCode(c.dial); setShowCountryPicker(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent/5 transition-colors ${c.dial === countryCode ? "bg-accent/8 font-bold" : ""}`}
                      >
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="text-[11px] font-medium text-foreground flex-1 truncate">{c.name}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">{c.dial}</span>
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No countries found</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex-1">
            <PremiumInput
              id="phone"
              name="phone"
              label="Phone Number"
              placeholder="Your number"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9\s\-]/g, "");
                setForm((f) => ({ ...f, phone: val }));
              }}
              required
              icon={<Phone />}
            />
          </div>
        </div>
        {form.phone.length > 0 && form.phone.replace(/[^0-9]/g, "").length < 6 && (
          <p className="text-[10px] font-bold text-destructive ml-1">Please enter a valid phone number</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3 pt-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Select Skill Level</label>
        <div className="grid grid-cols-2 gap-3">
          {levels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, experience_level: l.value }))}
              className={`p-4 rounded-xl border text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm ${form.experience_level === l.value
                ? "border-accent bg-accent/5 text-accent shadow-glow"
                : "border-border bg-background text-muted-foreground hover:border-accent/20 hover:bg-secondary/10"
                }`}
            >
              <span className="text-xl">{l.emoji}</span>
              {l.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-4">
        <div className="mb-3 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
            <span>Offer closing in</span>
            <span className="font-black tabular-nums text-emerald-800">{formatInlineTimer(timeLeft)}</span>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl btn-primary text-[13px] font-bold tracking-wide shadow-green-lg hover:scale-[1.01] active:scale-[0.98] transition-all border-0 flex items-center justify-center gap-2.5"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" />Creating your account...</>
          ) : (
            <>I want To Join <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>

      </motion.div>
    </motion.form>
  );
}
