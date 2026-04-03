import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, BookOpen, GraduationCap, Gift, ChevronRight, X, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const CANCEL_REASONS = [
  { value: "too_expensive", label: "It's too expensive for me" },
  { value: "not_using", label: "I'm not using it enough" },
  { value: "content_quality", label: "Content doesn't meet my expectations" },
  { value: "found_alternative", label: "I found a better alternative" },
  { value: "technical_issues", label: "Technical issues / bugs" },
  { value: "other", label: "Other reason" },
];

const UPCOMING_CONTENT = [
  { icon: GraduationCap, title: "Advanced Revit Modeling", desc: "Dropping this Saturday — master BIM workflows" },
  { icon: BookOpen, title: "Color Theory for Interiors", desc: "New book — 120 pages of palette science" },
  { icon: GraduationCap, title: "Lumion Cinematic Renders", desc: "Coming next week — Hollywood-quality walkthroughs" },
  { icon: BookOpen, title: "How to Win Design Competitions", desc: "Strategy guide from award-winning architects" },
];

interface CancelSubscriptionFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelSubscriptionFlow({ open, onOpenChange }: CancelSubscriptionFlowProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  const totalSteps = 6;

  const reset = () => {
    setStep(1);
    setReason("");
    setFeedback("");
    setRating(0);
    setConfirmText("");
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error || data?.error) {
        toast({ title: "Unable to open subscription management", description: data?.error || error?.message, variant: "destructive" });
      } else if (data?.url) {
        window.open(data.url, "_blank");
        toast({ title: "Redirecting to subscription management", description: "You can cancel your plan from the Stripe portal." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? "bg-accent" : "bg-muted"}`} />
          ))}
        </div>

        {/* Step 1: Are you sure? */}
        {step === 1 && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <DialogTitle className="text-center text-base font-black uppercase tracking-tight">Are you sure you want to leave?</DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed mt-2">
                You'll lose access to <strong>all courses</strong>, <strong>book library</strong>, <strong>freelance opportunities</strong>, and <strong>certificates</strong>. 
                Plus, you'll miss all upcoming content released every Saturday.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <Button onClick={() => handleClose()} className="w-full btn-gold text-white font-black text-[11px] uppercase tracking-widest rounded-full h-12">
                <Heart className="h-4 w-4 mr-2" /> I Want to Stay!
              </Button>
              <button onClick={() => setStep(2)} className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors py-2">
                Continue cancellation →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Why are you leaving? */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm font-black uppercase tracking-tight">We'd love to understand why</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Select the reason that best describes your situation.</DialogDescription>
            </DialogHeader>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2 mt-3">
              {CANCEL_REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-3 p-3 rounded-xl border border-border/30 hover:bg-muted/30 transition-colors cursor-pointer">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="text-xs font-bold cursor-pointer flex-1">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest h-10">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!reason} className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest h-10 bg-muted text-foreground hover:bg-muted/80">
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Show upcoming content (lure) */}
        {step === 3 && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <DialogTitle className="text-center text-sm font-black uppercase tracking-tight">You'll miss these new releases!</DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                New courses and books for Interior Designers & Architects drop every Saturday.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {UPCOMING_CONTENT.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20">
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded-full">New</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 mt-4">
              <Button onClick={() => handleClose()} className="w-full btn-gold text-white font-black text-[11px] uppercase tracking-widest rounded-full h-12">
                <Gift className="h-4 w-4 mr-2" /> Stay & Get New Content
              </Button>
              <button onClick={() => setStep(4)} className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors py-2">
                I still want to cancel →
              </button>
            </div>
          </>
        )}

        {/* Step 4: Rate your experience */}
        {step === 4 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm font-black uppercase tracking-tight">How would you rate your experience?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Your feedback helps us improve for everyone.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-2 mt-6 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-125 ${star <= rating ? "grayscale-0" : "grayscale opacity-30"}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              {rating === 0 ? "Tap to rate" : rating <= 2 ? "We're sorry to hear that" : rating <= 4 ? "Thanks for your feedback!" : "Glad you enjoyed it!"}
            </p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest h-10">Back</Button>
              <Button onClick={() => setStep(5)} disabled={rating === 0} className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest h-10 bg-muted text-foreground hover:bg-muted/80">
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* Step 5: Additional feedback */}
        {step === 5 && (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm font-black uppercase tracking-tight">Anything else you'd like to share?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Help us understand what we could do better.</DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Tell us what we could improve, what courses you'd like to see, or anything else on your mind..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-3 text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest h-10">Back</Button>
              <Button onClick={() => setStep(6)} className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest h-10 bg-muted text-foreground hover:bg-muted/80">
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* Step 6: Final confirmation */}
        {step === 6 && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <X className="h-7 w-7 text-red-500" />
              </div>
              <DialogTitle className="text-center text-sm font-black uppercase tracking-tight">Final Confirmation</DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed mt-2">
                Type <strong className="text-foreground">CANCEL</strong> below to confirm you want to end your subscription. You will be redirected to manage your subscription.
              </DialogDescription>
            </DialogHeader>
            <input
              type="text"
              placeholder='Type "CANCEL" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full mt-4 h-12 rounded-xl bg-background border-2 border-red-500/30 px-4 text-sm font-bold text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/40 uppercase tracking-widest"
            />
            <div className="space-y-3 mt-4">
              <Button onClick={() => handleClose()} className="w-full btn-gold text-white font-black text-[11px] uppercase tracking-widest rounded-full h-12">
                <Heart className="h-4 w-4 mr-2" /> Keep My Subscription
              </Button>
              <Button
                onClick={handleCancel}
                disabled={confirmText.toUpperCase() !== "CANCEL" || loading}
                variant="outline"
                className="w-full rounded-full text-[10px] font-black uppercase tracking-widest h-10 border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-30"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                Cancel Subscription
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
