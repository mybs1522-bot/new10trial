import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, KeyRound, Mail, Save, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CancelSubscriptionFlow } from "@/components/CancelSubscriptionFlow";

export default function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth();
  const [showCancelFlow, setShowCancelFlow] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleNameSave = async () => {
    if (!fullName.trim()) return toast.error("Name cannot be empty");
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", user!.id);
    setSavingName(false);
    if (error) return toast.error("Failed to update name");
    await refreshProfile();
    toast.success("Name updated successfully");
  };

  const handleEmailSave = async () => {
    if (!email.trim()) return toast.error("Email cannot be empty");
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setSavingEmail(false);
    if (error) return toast.error(error.message);
    toast.success("Confirmation email sent. Check your inbox to verify.");
  };

  const handlePasswordSave = async () => {
    if (!newPassword || !confirmPassword) return toast.error("Fill in all password fields");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return toast.error(error.message);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully");
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Account</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">My Profile</h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">Manage your account details and security.</p>
        </div>

        <div className="space-y-6">
          {/* Name Section */}
          <div className="premium-card !p-5 sm:!p-6 shadow-glass space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center border-t border-accent/20">
                <User className="h-4 w-4 text-accent" />
              </div>
              <h2 className="font-black text-foreground text-[11px] uppercase tracking-tight">Full Name</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <button onClick={handleNameSave} disabled={savingName} className="btn-gold px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Name
            </button>
          </div>

          {/* Email Section */}
          <div className="premium-card !p-5 sm:!p-6 shadow-glass space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center border-t border-accent/20">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <h2 className="font-black text-foreground text-[11px] uppercase tracking-tight">Email Address</h2>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <button onClick={handleEmailSave} disabled={savingEmail} className="btn-gold px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              {savingEmail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Update Email
            </button>
          </div>

          {/* Password Section */}
          <div className="premium-card !p-5 sm:!p-6 shadow-glass space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center border-t border-accent/20">
                <KeyRound className="h-4 w-4 text-accent" />
              </div>
              <h2 className="font-black text-foreground text-[11px] uppercase tracking-tight">Change Password</h2>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <button onClick={handlePasswordSave} disabled={savingPassword} className="btn-gold px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              {savingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Update Password
            </button>
          </div>
          {/* Subscription Management */}
          {profile?.has_paid && (
            <div className="premium-card !p-5 sm:!p-6 shadow-glass space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center border-t border-accent/20">
                  <CreditCard className="h-4 w-4 text-accent" />
                </div>
                <h2 className="font-black text-foreground text-[11px] uppercase tracking-tight">Subscription</h2>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                You're currently on the <strong className="text-foreground">Design & AI Mastery</strong> plan — $10/mo with new content every Saturday.
              </p>
              <button
                onClick={() => setShowCancelFlow(true)}
                className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-red-400 transition-colors mt-2"
              >
                Cancel subscription
              </button>
            </div>
          )}
        </div>

        <CancelSubscriptionFlow open={showCancelFlow} onOpenChange={setShowCancelFlow} />
      </div>
    </DashboardLayout>
  );
}
