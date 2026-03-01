import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const TOUR_LAST_SHOWN = "dashboard_tour_last_shown";
const ONE_HOUR = 60 * 60 * 1000;

type Phase = "idle" | "message" | "navigate" | "fadeout" | "done";

export function DashboardTour() {
  const [phase, setPhase] = useState<Phase>(() => {
    const last = localStorage.getItem(TOUR_LAST_SHOWN);
    if (last && Date.now() - parseInt(last, 10) < ONE_HOUR) return "done";
    return "idle";
  });
  const navigate = useNavigate();
  const mounted = useRef(true);

  const safeSetPhase = (p: Phase) => {
    if (mounted.current) setPhase(p);
  };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(() => safeSetPhase("message"), 600);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "message") return;
    const t = setTimeout(() => {
      navigate("/dashboard/freelance", { replace: true });
      safeSetPhase("navigate");
    }, 2500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "navigate") return;
    const t = setTimeout(() => safeSetPhase("fadeout"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fadeout") return;
    const t = setTimeout(() => {
      localStorage.setItem(TOUR_LAST_SHOWN, Date.now().toString());
      navigate("/dashboard", { replace: true });
      safeSetPhase("done");
    }, 500);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-end sm:items-center justify-center pb-6 sm:pb-0 px-4 transition-opacity duration-500",
      phase === "fadeout" ? "opacity-0" : "opacity-100"
    )}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className={cn(
        "relative w-full max-w-xs rounded-2xl border border-border/30 shadow-2xl overflow-hidden transition-all duration-500",
        phase === "fadeout" ? "scale-95 translate-y-4" : "scale-100 translate-y-0"
      )}
        style={{ background: "linear-gradient(135deg, hsl(220 20% 10%) 0%, hsl(220 20% 6%) 100%)" }}>

        <div className="p-5 sm:p-6 text-center">
          <div className="h-12 w-12 rounded-2xl mx-auto mb-3 flex items-center justify-center btn-gold shadow-gold">
            <Briefcase className="h-5 w-5 text-white" />
          </div>

          <h2 className="text-sm sm:text-base font-black text-white mb-1.5 tracking-tight">
            Need Freelance Design Work?
          </h2>

          <p className="text-white/50 text-xs leading-relaxed">
            Check this tab to browse design projects from clients across India.
          </p>

          <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-accent rounded-full animate-[tourProgress_4s_linear]" />
          </div>
        </div>
      </div>
    </div>
  );
}
