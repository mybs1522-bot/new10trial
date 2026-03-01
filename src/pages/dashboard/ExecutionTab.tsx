import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle, Layers, Zap, Hammer, ChefHat, Droplets, Layout, PaintBucket, ShoppingBag } from "lucide-react";

const MODULES = [
  { icon: Layers, label: "False Ceiling", desc: "Types, materials, grid layout, and labour cost breakdown." },
  { icon: Zap, label: "Electrical Work", desc: "Wiring plans, load calculation, sourcing switches & panels." },
  { icon: Hammer, label: "Wood Work", desc: "Modular vs carpenter, material grades, cost optimisation." },
  { icon: ChefHat, label: "Kitchen", desc: "Layout planning, shutter materials, countertop sourcing." },
  { icon: Droplets, label: "Sanitary & Plumbing", desc: "Fixture selection, CP fittings, installation sequences." },
  { icon: Layout, label: "Flooring", desc: "Tile vs marble vs vinyl — cost, quality, vendor selection." },
  { icon: PaintBucket, label: "Paint", desc: "Finish types, brand comparison, quantity estimation." },
  { icon: ShoppingBag, label: "Material Sourcing", desc: "Wholesale markets, negotiation tips, vendor management." },
];

export default function ExecutionTab() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const hasAccess = profile?.has_execution_plan;

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-10">
            <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Construction Mastery</p>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Execution Training</h1>
            <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">In-depth execution knowledge with real-site walkthroughs.</p>
          </div>

          {/* Paywall banner */}
          {/* Paywall banner */}
          <div className="relative overflow-hidden premium-card !p-10 text-center border-accent/20"
            style={{ background: "linear-gradient(135deg, hsl(38 62% 10%) 0%, hsl(220 20% 6%) 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(38 62% 61% / 0.4), transparent)" }} />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl mx-auto mb-6 flex items-center justify-center btn-gold shadow-gold">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-4">Premium Module</p>
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Master Real-World Execution</h2>
              <p className="text-white/60 text-[13px] font-medium mb-8 max-w-sm mx-auto leading-relaxed border-t border-white/5 pt-6 mt-6 uppercase tracking-tight">
                Learn exactly how to execute every part of an interior project with professional coordination and quality.
              </p>
              <div className="flex items-baseline justify-center gap-1 mb-8">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mr-2">Investment:</span>
                <span className="text-white/60 text-lg font-medium">₹</span>
                <span className="text-4xl font-black text-white tracking-tighter">5,000</span>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest ml-2">Final Access</span>
              </div>
              <button
                onClick={() => navigate("/dashboard/payment?plan=execution")}
                className="btn-gold px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] text-white shadow-gold transition-all hover:scale-105 active:scale-95"
              >
                Enroll in Construction Plan
              </button>
            </div>
          </div>

          {/* Module preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULES.map((mod) => (
              <div key={mod.label} className="premium-card !p-5 opacity-60 grayscale-[0.5]">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 border-t border-border/20">
                    <mod.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-foreground text-xs uppercase tracking-tight">{mod.label}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight mt-0.5">{mod.desc}</p>
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground/30 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-green-500/5 text-green-500 px-3 py-1.5 rounded-lg border-t border-green-500/10 flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5" /> Full Access Unlocked
            </span>
          </div>
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Construction Mastery</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Execution Training</h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">In-depth execution knowledge with real-site walkthroughs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULES.map((mod) => (
            <div key={mod.label} className="premium-card !p-5 card-hover cursor-pointer group shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 btn-gold shadow-gold group-hover:scale-110 transition-transform duration-500">
                  <mod.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-foreground text-xs uppercase tracking-tight">{mod.label}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-0.5 leading-tight">{mod.desc}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/10 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-accent group-hover:translate-x-1 transition-transform">View Module →</span>
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
