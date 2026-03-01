import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, MapPin, ArrowRight } from "lucide-react";

const options = [
  {
    id: "online",
    icon: Globe,
    title: "I want to learn online",
    subtitle: "Available worldwide",
    badge: "🌐 Worldwide",
    description: "Access all course content, books, and resources from anywhere. Learn at your own pace with self-paced and live sessions.",
  },
  {
    id: "offline",
    icon: MapPin,
    title: "I want to learn on real projects",
    subtitle: "Currently available in Delhi / NCR",
    badge: "📍 Delhi / NCR",
    description: "Learn by doing — visit real project sites, network with designers, and get hands-on execution experience.",
  },
];

export default function ModeSelectionPage() {
  const { user, refreshProfile, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.mode) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  const handleContinue = async () => {
    if (!selected || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ mode: selected })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error saving preference", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }
    await refreshProfile();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Brand */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-accent shadow-green">
          <span className="text-2xl text-white">✦</span>
        </div>
        <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Onboarding</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight max-w-lg leading-tight">
          Select Your Learning Path
        </h1>
        <p className="text-muted-foreground text-[13px] font-medium mt-4 max-w-sm mx-auto leading-relaxed">
          Tailor your learning experience. You can always change this later.
        </p>
      </div>

      {/* Option Cards */}
      <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-4 mb-8">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`
                relative text-left rounded-2xl p-6 sm:p-8 transition-all duration-300 border
                ${isSelected
                  ? `border-accent bg-accent/[0.03] shadow-glow scale-[1.02]`
                  : `border-border/30 bg-white shadow-soft hover:shadow-lift hover:border-accent/20`
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}

              <div className="mb-5">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-accent">Learning Mode</span>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
                  {opt.id === "online" ? "Online" : "Offline"}
                </h2>
              </div>

              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-accent/8">
                <opt.icon className="h-5 w-5 text-accent" />
              </div>

              <div className="inline-flex items-center gap-2 text-[10px] font-bold text-accent bg-accent/6 px-3 py-1.5 rounded-lg mb-5">
                {opt.badge}
              </div>

              <p className="text-[12px] text-muted-foreground leading-relaxed">{opt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!selected || saving}
        className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-[12px] uppercase tracking-[0.12em] text-white transition-all btn-primary disabled:opacity-30 shadow-green-lg hover:scale-[1.03] active:scale-[0.97]"
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Finalizing…</>
        ) : (
          <>Continue <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </div>
  );
}
