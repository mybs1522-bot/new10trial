import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PremiumInput } from "@/components/PremiumFormComponents";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/components/PremiumFormWrapper";

type Tab = "password" | "otp";

export function LoginForm({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("password");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword(form);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    onClose?.();
    if (roleData) navigate("/admin");
    else navigate("/dashboard");
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setForgotSent(true);
    }
    setForgotLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      email: otpEmail,
      options: { shouldCreateUser: false }
    });
    if (error) {
      toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
    } else {
      setOtpSent(true);
      toast({ title: "OTP sent!", description: "Check your email for the 6-digit code." });
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({ 
      email: otpEmail, 
      token: otp, 
      type: "email" 
    });
    if (sessionError || !sessionData?.user) {
      toast({ title: "Invalid OTP", description: sessionError?.message || "Verification failed", variant: "destructive" });
      setOtpLoading(false);
      return;
    }
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", sessionData.user.id).eq("role", "admin").maybeSingle();
    onClose?.();
    if (roleData) navigate("/admin");
    else navigate("/dashboard");
    setOtpLoading(false);
  };

  const TabPill = ({ id, label }: { id: Tab; label: string }) => (
    <button
      type="button"
      onClick={() => { setTab(id); setForgotMode(false); }}
      className={`flex-1 py-3 text-[13px] font-bold rounded-xl transition-all duration-300 ${tab === id
        ? "bg-foreground text-white shadow-md scale-[1.02]"
        : "text-muted-foreground hover:text-foreground hover:bg-white/50"
        }`}
    >
      {label}
    </button>
  );

  if (forgotMode) {
    return (
      <div className="space-y-6">
        {forgotSent ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center bg-accent/5 rounded-2xl border border-accent/10">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <div className="space-y-1 px-4">
              <p className="text-lg font-bold text-foreground">Link Sent!</p>
              <p className="text-sm text-muted-foreground">Check <strong>{forgotEmail}</strong> for instructions.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setForgotMode(false); setForgotSent(false); }} className="mt-2 font-bold text-accent">
              Back to Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">Reset Password</p>
              <p className="text-sm text-muted-foreground">We'll send a secure link to your email</p>
            </div>
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleForgotPassword} className="space-y-5">
              <PremiumInput id="forgot-email" label="Email Address" type="email" placeholder="your@email.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required icon={<Mail />} />
              <motion.div variants={itemVariants}>
                <Button type="submit" disabled={forgotLoading} className="w-full h-14 rounded-xl btn-primary text-[13px] font-bold shadow-green-lg border-0">
                  {forgotLoading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Sending…</> : "Send Reset Link"}
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button type="button" variant="ghost" className="w-full text-xs font-bold text-muted-foreground" onClick={() => setForgotMode(false)}>
                  Cancel
                </Button>
              </motion.div>
            </motion.form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-2xl mb-4 border border-border/20 backdrop-blur-sm">
        <TabPill id="password" label="Password" />
        <TabPill id="otp" label="Magic Link" />
      </div>

      {tab === "password" && (
        <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handlePasswordLogin} className="space-y-5">
          <PremiumInput id="login-email" label="Email Address" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required icon={<Mail />} />

          <div className="relative">
            <PremiumInput id="login-password" type="password" label="Password" placeholder="Your account password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required icon={<Lock />} />
            <button type="button" onClick={() => { setForgotEmail(form.email); setForgotMode(true); }} className="absolute -top-1 right-0 text-[11px] font-bold text-accent hover:text-accent/80 transition-colors z-20 px-1 py-1">
              Forgot?
            </button>
          </div>

          <motion.div variants={itemVariants}>
            <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl btn-primary text-[13px] font-bold shadow-green-lg border-0 flex items-center justify-center gap-2.5">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Authenticating…</> : <>Sign In Securely <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </motion.div>
        </motion.form>
      )}

      {tab === "otp" && (
        <div className="space-y-6">
          {!otpSent ? (
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleSendOtp} className="space-y-5">
              <PremiumInput id="otp-email" label="Email Address" type="email" placeholder="your@email.com" value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} required icon={<Mail />} />
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-[12px] font-semibold text-accent leading-relaxed text-center">
                  We'll email you a secure 6-digit code. No password required for entry.
                </p>
              </div>
              <motion.div variants={itemVariants}>
                <Button type="submit" disabled={otpLoading} className="w-full h-14 rounded-xl btn-primary text-[13px] font-bold shadow-green-lg border-0 flex items-center justify-center gap-2.5">
                  {otpLoading ? <><Loader2 className="h-5 w-5 animate-spin" />Sending code…</> : <>Generate Code <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form variants={containerVariants} initial="hidden" animate="visible" onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-foreground">Verify Identity</h3>
                <p className="text-sm font-medium text-muted-foreground px-4">
                  Enter the 6-digit code we sent to <span className="text-accent font-bold">{otpEmail}</span>
                </p>
              </div>
              <div className="flex justify-center py-2">
                <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-14 w-12 sm:h-16 sm:w-14 text-xl font-bold bg-background border-2 border-border/40 rounded-2xl focus:border-accent focus:shadow-glow transition-all duration-300 shadow-sm" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <motion.div variants={itemVariants}>
                <Button type="submit" disabled={otpLoading || otp.length < 6} className="w-full h-14 rounded-xl btn-primary text-[13px] font-bold shadow-green-lg border-0 flex items-center justify-center gap-2.5">
                  {otpLoading ? <><Loader2 className="h-5 w-5 animate-spin" />Verifying…</> : <>Complete Sign In <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </motion.div>
              <motion.button variants={itemVariants} type="button" onClick={() => { setOtpSent(false); setOtp(""); }} className="w-full text-xs font-black text-muted-foreground hover:text-accent text-center tracking-widest uppercase transition-all">
                Resend Code
              </motion.button>
            </motion.form>
          )}
        </div>
      )
      }
    </div >
  );
}
