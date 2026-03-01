import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { PremiumFormWrapper, itemVariants } from "@/components/PremiumFormWrapper";
import { PremiumInput } from "@/components/PremiumFormComponents";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidSession(true);
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      setDone(true);
      setTimeout(() => navigate("/"), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md premium-card !p-10 shadow-glass-lg border-white/5 space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 btn-gold rounded-xl flex items-center justify-center shadow-gold">
            <span className="text-white font-black text-sm">ID</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Security Gate</p>
            <h1 className="text-xs font-black uppercase tracking-tight text-foreground -mt-1">Execution Mastery</h1>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="h-20 w-20 rounded-full bg-green-500/5 flex items-center justify-center border-t border-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Password Updated!</h2>
              <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-tight">Redirecting to headquarters…</p>
            </div>
          </div>
        ) : (
          <>
            <PremiumFormWrapper
              title="Reset Key"
              subtitle="Generate a more secure credential"
              className="!p-0 border-none bg-transparent shadow-none space-y-8"
              animate="visible"
              initial="hidden"
            >
              <form onSubmit={handleReset} className="space-y-6">
                <PremiumInput
                  label="New Credential"
                  type="password"
                  placeholder="MIN. 6 CHARACTERS"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="h-4 w-4 text-accent" />}
                />
                <PremiumInput
                  label="Confirm Update"
                  type="password"
                  placeholder="REPEAT CREDENTIAL"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  icon={<Lock className="h-4 w-4 text-accent" />}
                />
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading || !validSession}
                    className="w-full h-16 btn-gold rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-gold-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-3" />Synchronizing…</> : "Deploy New Key"}
                  </Button>
                </motion.div>
              </form>
            </PremiumFormWrapper>
          </>
        )}
      </div>
    </div>
  );
}
