import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  GraduationCap, BookOpen, Award, Briefcase, MessageSquare,
  ArrowRight, CheckCircle, ShieldCheck, Zap,
  Globe, PlayCircle, FileText, Layers, TrendingUp, Star,
  DollarSign, Users, Clock, Sparkles, Target, Rocket, Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────
const OUTCOMES = [
  { icon: PlayCircle, text: "50+ HD video lessons — learn at your own pace, anywhere", highlight: "50+" },
  { icon: FileText, text: "Downloadable books, guides & design templates worth $500+", highlight: "$500+" },
  { icon: Layers, text: "Full design workflow: concepts, client delivery & invoicing", highlight: "client delivery" },
  { icon: TrendingUp, text: "Certificate of completion — start earning in 30 days", highlight: "30 days" },
];

const LEARN = [
  "Space Planning & Layouts", "AutoCAD & SketchUp", "3D Rendering & AI Tools",
  "Material & Color Selection", "Client Proposals & Pricing", "Design Workflow",
  "Project Management", "Freelance Business Setup",
];

const FREELANCE_GIGS = [
  { title: "Residential Room Redesign", pay: "$300–$800", time: "3–5 days", level: "Beginner" },
  { title: "Full Home Interior Plan", pay: "$1,200–$3,500", time: "1–2 weeks", level: "Intermediate" },
  { title: "Commercial Space Layout", pay: "$2,000–$5,000", time: "2–3 weeks", level: "Intermediate" },
  { title: "3D Rendering Package", pay: "$150–$500/render", time: "1–2 days", level: "Beginner" },
];

const STUDENT_EARNINGS = [
  { name: "Priya S.", location: "Mumbai", earned: "$2,400", period: "first 2 months", text: "Landed 3 residential projects from Instagram before I even finished the course." },
  { name: "James K.", location: "New York", earned: "$4,100", period: "first month", text: "The freelance module alone paid for the entire course 40x over. Insane ROI." },
  { name: "Sofia M.", location: "Toronto", earned: "$1,800", period: "in 3 weeks", text: "Started with 3D renders for local realtors. Now I have a waitlist." },
];

const TESTIMONIALS = [
  { name: "Emma C.", city: "London", text: "Finished the course in 3 weeks. Landed my first interior project right after.", earned: "$1,200" },
  { name: "James P.", city: "New York", text: "The design templates alone saved me hours on every project.", earned: "$3,800/mo" },
  { name: "Sofia M.", city: "Toronto", text: "Best investment I made. Clear, practical and zero fluff.", earned: "$2,100" },
];

const quickLinks = [
  { label: "My Courses", icon: GraduationCap, to: "/dashboard/courses", color: "bg-accent/6", iconColor: "text-accent" },
  { label: "Books", icon: BookOpen, to: "/dashboard/books", color: "bg-blue-50 dark:bg-blue-950/20", iconColor: "text-blue-600" },
  { label: "Messages", icon: MessageSquare, to: "/dashboard/messages", color: "bg-purple-50 dark:bg-purple-950/20", iconColor: "text-purple-600" },
  { label: "Certificates", icon: Award, to: "/dashboard/certificates", color: "bg-amber-50 dark:bg-amber-950/20", iconColor: "text-amber-600" },
  { label: "Freelance", icon: Briefcase, to: "/dashboard/freelance", color: "bg-sky-50 dark:bg-sky-950/20", iconColor: "text-sky-600" },
];

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile?.has_paid) {
    return <SalesPage profile={profile} navigate={navigate} />;
  }

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 mb-6 bg-foreground text-white">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(152,56%,45%), transparent)" }} />
          <div className="relative">
            <p className="text-accent text-[10px] font-bold tracking-[0.15em] uppercase mb-3">Welcome back</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              {profile?.full_name || "Designer"}
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {profile?.location && (
                <span className="text-[10px] font-medium text-white/40 bg-white/5 border border-white/8 px-3 py-1.5 rounded-lg">📍 {profile.location}</span>
              )}
              <span className="text-[10px] font-medium text-white/40 bg-white/5 border border-white/8 px-3 py-1.5 rounded-lg">
                🌐 Online Program
              </span>
            </div>
            <div className="mt-6 pt-6 border-t border-white/6">
              <p className="text-white/25 text-[11px] font-medium leading-relaxed italic">
                "Design is not decoration. It is execution with intelligence."
              </p>
            </div>
          </div>
        </div>

        {/* Get Freelance Work CTA */}
        <button
          onClick={() => navigate("/dashboard/freelance")}
          className="w-full rounded-2xl p-4 sm:p-5 flex items-center gap-4 mb-6 group border border-border/30 bg-white shadow-soft card-hover text-left"
        >
          <div className="h-11 w-11 rounded-xl bg-accent flex-shrink-0 flex items-center justify-center shadow-green">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground tracking-tight">Get Freelance Work</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Browse design projects from clients worldwide</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/30 flex-shrink-0 group-hover:translate-x-1 group-hover:text-accent transition-all" />
        </button>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.to)}
              className="group rounded-2xl border border-border/30 bg-white p-4 sm:p-5 text-left shadow-soft card-hover"
            >
              <div className={cn("h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center mb-4", link.iconColor, link.color, "transition-all duration-200")}>
                <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-[11px] font-bold text-foreground">{link.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-accent transition-colors">Explore →</p>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}


// ── Sales Landing (unpaid students) ───────────────────────────────────
function SalesPage({ profile, navigate }: { profile: any; navigate: any }) {
  const [spotsLeft, setSpotsLeft] = useState(17);

  useEffect(() => {
    const stored = localStorage.getItem("avada_spots");
    if (stored) setSpotsLeft(parseInt(stored));
    else localStorage.setItem("avada_spots", "17");
  }, []);

  const UnlockBtn = ({ label = "Start Free Now", large = false, variant = "primary" }: { label?: string; large?: boolean; variant?: string }) => (
    <button
      onClick={() => navigate("/dashboard/payment")}
      className={cn(
        "rounded-full font-extrabold text-white transition-all hover:scale-[1.03] active:scale-[0.98]",
        variant === "primary" ? "btn-primary shadow-green-lg" : "bg-white text-foreground shadow-lift hover:shadow-green",
        large ? "px-8 sm:px-10 py-4 text-[14px]" : "px-6 sm:px-7 py-3 text-[12px]"
      )}
    >
      {label} <span className="ml-1">→</span>
    </button>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-5">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-10 text-center bg-foreground">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(152,56%,50%), transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(152,56%,60%), transparent)" }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/20 rounded-full px-4 py-1.5 mb-5">
              <Sparkles className="h-3 w-3 text-accent" />
              <span className="text-[10px] font-black text-accent uppercase tracking-wider">Learn · Design · Earn</span>
            </div>
            {profile?.full_name && (
              <p className="text-accent/80 text-base sm:text-lg font-semibold mb-1">
                Hey {profile.full_name.split(" ")[0]}, your future starts here 👋
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-black text-white leading-[1.15] mb-4 tracking-tight">
              Turn Your Design Skills<br />
              Into a <span className="text-green-gradient">$3K–$10K/Month</span> Business
            </h1>
            <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto mb-7 leading-relaxed">
              Learn interior design with AI tools. Get certified. Start freelancing — <strong className="text-white/80">students earn their first dollar within 30 days.</strong>
            </p>
            <UnlockBtn label="Claim Your Free Access" large />
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mt-6">
              {[{ icon: ShieldCheck, t: "7-Day Free Trial" }, { icon: Zap, t: "Instant Access" }, { icon: Award, t: "Paid Certificate" }].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-1.5 text-white/30 text-[11px] font-medium"><Icon className="h-3.5 w-3.5" />{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FREELANCE INCOME BAIT ── */}
        <div className="rounded-2xl p-5 sm:p-7 border border-accent/15 bg-accent/[0.03]">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center shadow-green">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground tracking-tight">Freelance Opportunities Waiting For You</p>
              <p className="text-[11px] text-muted-foreground">Real gigs our students land within 30 days of starting</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {FREELANCE_GIGS.map((gig) => (
              <div key={gig.title} className="rounded-xl p-4 bg-white border border-border/30 shadow-soft group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-accent/10 text-accent text-[9px] font-black px-2.5 py-1 rounded-bl-lg uppercase tracking-wider">
                  {gig.level}
                </div>
                <p className="text-[13px] font-bold text-foreground mb-2 pr-16">{gig.title}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 text-accent" />
                    <span className="text-[12px] font-black text-accent">{gig.pay}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[11px] text-muted-foreground">{gig.time}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-foreground/[0.97] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                  <div className="text-center">
                    <Lock className="h-5 w-5 text-accent mx-auto mb-2" />
                    <p className="text-white text-[12px] font-bold">Unlock with Full Access</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-[11px] text-muted-foreground mb-3">+ 200 more gigs posted every week by real clients worldwide</p>
            <UnlockBtn label="Start Earning Today" />
          </div>
        </div>

        {/* ── STUDENT EARNINGS PROOF ── */}
        <div className="rounded-2xl p-5 sm:p-7 bg-foreground">
          <div className="text-center mb-6">
            <p className="text-accent text-[10px] font-black tracking-[0.15em] uppercase mb-2">Real Results</p>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Students Who Earn While Learning</h2>
            <p className="text-white/40 text-[12px] mt-2">Average student earns back 40x their investment in the first 60 days</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {STUDENT_EARNINGS.map(({ name, location, earned, period, text }) => (
              <div key={name} className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-accent fill-accent" />)}
                </div>
                <p className="text-accent text-lg font-black mb-0.5">{earned}</p>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-3">earned {period}</p>
                <p className="text-white/50 text-[12px] italic leading-relaxed mb-4">"{text}"</p>
                <div className="pt-3 border-t border-white/[0.06]">
                  <p className="text-white/70 text-[11px] font-bold">{name}</p>
                  <p className="text-white/30 text-[10px]">{location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT YOU GET ── */}
        <div className="grid sm:grid-cols-2 gap-3">
          {OUTCOMES.map(({ icon: Icon, text }) => (
            <div key={text} className="rounded-2xl px-4 py-4 border border-border/30 flex items-center gap-3.5 bg-white shadow-soft card-hover">
              <div className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-accent shadow-green">
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <p className="text-[13px] font-semibold text-foreground leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* ── INCOME BREAKDOWN ── */}
        <div className="rounded-2xl p-5 sm:p-7 border border-border/30 bg-white shadow-soft">
          <div className="flex items-center gap-2.5 mb-5">
            <Target className="h-5 w-5 text-accent" />
            <p className="text-sm font-black text-foreground tracking-tight">Your Earning Potential After This Course</p>
          </div>
          <div className="space-y-3">
            {[
              { level: "Week 1–2", role: "3D Renders for Realtors", income: "$150–$500/render", bar: "w-[25%]" },
              { level: "Month 1", role: "Room Makeover Consultations", income: "$300–$800/project", bar: "w-[45%]" },
              { level: "Month 2–3", role: "Full Interior Design Projects", income: "$1,500–$5,000/project", bar: "w-[70%]" },
              { level: "Month 6+", role: "Design Studio / Agency", income: "$5,000–$10,000+/month", bar: "w-full" },
            ].map(({ level, role, income, bar }) => (
              <div key={level} className="flex items-center gap-4">
                <div className="w-16 sm:w-20 flex-shrink-0">
                  <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">{level}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-semibold text-foreground">{role}</p>
                    <p className="text-[11px] font-black text-accent">{income}</p>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full bg-accent/60", bar)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CURRICULUM ── */}
        <div className="rounded-2xl p-5 sm:p-6 border border-border/30 bg-white shadow-soft">
          <p className="text-accent text-[10px] font-black tracking-[0.15em] uppercase mb-4">What You'll Master</p>
          <div className="grid grid-cols-2 gap-3">
            {LEARN.map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                <span className="text-[12px] text-foreground/80 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT'S INCLUDED ── */}
        <div className="rounded-2xl p-5 sm:p-6 border border-border/30 bg-white shadow-soft">
          <p className="text-accent text-[10px] font-black tracking-[0.15em] uppercase mb-4">Everything You Get</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { emoji: "🎬", label: "50+ Video Lessons", sub: "HD quality, self-paced", value: "$299 value" },
              { emoji: "📚", label: "5 Design Books", sub: "Downloadable PDF guides", value: "$149 value" },
              { emoji: "🤖", label: "AI Tool Suite", sub: "AI rendering & workflows", value: "$199 value" },
            ].map(({ emoji, label, sub, value }) => (
              <div key={label} className="rounded-xl p-4 border border-border/20 bg-secondary/30">
                <div className="text-3xl mb-2">{emoji}</div>
                <p className="font-bold text-foreground text-sm">{label}</p>
                <p className="text-muted-foreground text-[11px] mt-1">{sub}</p>
                <p className="text-accent text-[10px] font-black mt-2">{value}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 pt-4 border-t border-border/20">
            <p className="text-muted-foreground text-[12px]">Total value: <span className="line-through">$647</span></p>
            <p className="text-foreground text-lg font-black mt-1">You get everything for just <span className="text-accent">$19/month</span></p>
          </div>
        </div>

        {/* ── SOCIAL PROOF ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TESTIMONIALS.map(({ name, city, text, earned }) => (
            <div key={name} className="rounded-2xl p-4 border border-border/30 bg-white shadow-soft card-hover">
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-accent fill-accent" />)}
              </div>
              <p className="text-[12px] text-muted-foreground italic mb-3 leading-relaxed">"{text}"</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-foreground">{name} <span className="text-muted-foreground font-normal">· {city}</span></p>
                <span className="text-[10px] font-black text-accent bg-accent/8 px-2 py-0.5 rounded-full">Earned {earned}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── URGENCY + FINAL CTA ── */}
        <div className="rounded-2xl p-6 sm:p-8 text-center bg-foreground relative overflow-hidden">
          <div className="absolute top-0 left-1/3 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(152,56%,50%), transparent)" }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/20 rounded-full px-3 py-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Only {spotsLeft} spots left this week</span>
            </div>
            <h2 className="text-white font-black text-xl sm:text-2xl mb-2 tracking-tight">
              Stop Watching. Start <span className="text-green-gradient">Earning.</span>
            </h2>
            <p className="text-white/40 text-[12px] mb-6 max-w-md mx-auto leading-relaxed">
              7-day free trial · Cancel anytime · Students earn an average of <strong className="text-white/70">$2,400 in their first 60 days</strong>
            </p>
            <UnlockBtn label="Start Your Free Trial Now" large />
            <p className="text-white/20 text-[10px] mt-4 font-medium">
              🔒 No credit card required to start · Instant access to all content
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
