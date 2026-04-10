import { DashboardLayout } from "@/components/DashboardLayout";
import { CheckCircle, BookOpen, Layers, TrendingUp, Briefcase, Award, Zap, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SYLLABUS = [
  {
    title: "AutoCAD Plan Designing",
    icon: Monitor,
    topics: ["2D floor plans & sections", "Working drawings & dimensions", "Layout planning for all room types"],
  },
  {
    title: "SketchUp 3D Designing",
    icon: Layers,
    topics: ["3D modeling from scratch", "Walkthroughs & client presentations", "Material & texture application"],
  },
  {
    title: "D5 Render — Photo & Video",
    icon: Zap,
    topics: ["Photorealistic rendering", "Cinematic video walkthroughs", "Lighting & atmosphere setup"],
  },
  {
    title: "AI Rendering Tools",
    icon: TrendingUp,
    topics: ["AI-powered instant renders", "Style transfer & mood boards", "Rapid design iteration"],
  },
  {
    title: "Design-to-Execution Workflow",
    icon: Briefcase,
    topics: ["BOQ & cost estimation", "Vendor & contractor coordination", "Site supervision essentials"],
  },
  {
    title: "Client & Project Management",
    icon: Award,
    topics: ["Client proposals & pitching", "Project timelines & delivery", "Freelance business setup"],
  },
];

const BOOKS = [
  "How to Design Kitchen",
  "How to Design Washroom",
  "How to Design Study",
  "How to Design Bedroom",
  "How to Design Living Room",
  "How to Design Exteriors",
];

const BENEFITS = [
  "Go from zero to job-ready in 30 days",
  "Build a professional portfolio with real projects",
  "Learn industry-standard software used by top firms",
  "Get a certificate of completion to boost your profile",
  "Access downloadable books & templates for every project",
  "Gain freelance skills to start earning independently",
];

export default function StartCourseTab() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 sm:space-y-12">

        {/* Header */}
        <div>
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Course Overview</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight uppercase">
            Interior Design & AI Mastery
          </h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic max-w-xl">
            A complete self-paced program covering design software, AI tools, execution workflows, and freelance skills — everything you need to become a professional interior designer.
          </p>
        </div>

        {/* Intro Video */}
        <div className="premium-card !p-0 overflow-hidden shadow-glass-lg border-white/5">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://iframe.mediadelivery.net/embed/494628/a8b8b480-201f-4099-ac67-2a42b9a1b61c?autoplay=true&loop=false&muted=true&preload=true&responsive=true"
              title="Course Introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              style={{ border: "none" }}
            />
          </div>
          <div className="p-4 sm:p-5 border-t border-white/5 bg-muted/20">
            <p className="font-black text-foreground text-[11px] uppercase tracking-tight">Course Introduction & What You'll Learn</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mt-1">Watch Overview</p>
          </div>
        </div>

        {/* Syllabus */}
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Course Syllabus</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SYLLABUS.map(({ title, icon: Icon, topics }) => (
              <div key={title} className="premium-card !p-5 shadow-sm card-hover">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center border-t border-accent/20 flex-shrink-0">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="font-black text-foreground text-[11px] uppercase tracking-tight">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {topics.map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-accent flex-shrink-0" />
                      <span className="text-[11px] font-medium text-muted-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Books Included */}
        <div className="premium-card !p-6 sm:!p-8 shadow-glass border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-6 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" /> Design Books Included
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BOOKS.map((book) => (
              <div key={book} className="flex items-center gap-2.5 bg-muted/20 rounded-lg px-3 py-2.5 border border-border/20">
                <span className="text-base">📚</span>
                <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">{book}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-medium text-muted-foreground mt-4 italic">
            Downloadable PDF guides covering room-by-room design execution with real-world tips.
          </p>
        </div>

        {/* How It Helps */}
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">How This Course Helps You</h2>
          <div className="space-y-3">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3 premium-card !p-4 shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-6 sm:p-8 text-center border border-accent/20"
          style={{ background: "linear-gradient(135deg, hsl(38 62% 10%) 0%, hsl(220 20% 6%) 100%)" }}>
          <p className="text-white font-black text-lg sm:text-xl mb-2 uppercase tracking-tight">Ready to become a professional designer?</p>
          <p className="text-white/50 text-[11px] sm:text-xs mb-6 font-medium">$20/mo · New content every Saturday</p>
          <button
            onClick={() => navigate("/dashboard/payment")}
            className="btn-gold px-8 sm:px-10 py-3 sm:py-4 rounded-full text-sm sm:text-base font-black uppercase tracking-widest shadow-gold hover:scale-105 transition-transform"
          >
            🚀 Start Designing Now
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
