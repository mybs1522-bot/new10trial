import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Lock, BookOpen, GraduationCap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import courseAutocad from "@/assets/course-autocad.jpg";
import courseSketchup from "@/assets/course-sketchup.jpg";
import courseD5 from "@/assets/course-d5render.jpg";
import courseAi from "@/assets/course-airender.jpg";
import courseWorkflow from "@/assets/course-workflow.jpg";
import courseClient from "@/assets/course-client.jpg";

const COURSES_LINK = "https://drive.google.com/drive/folders/1CCyv9u82HiYI8jnyULISfBoGMcbcqd9U?usp=drive_link";

const COURSES = [
  { id: "autocad", title: "AutoCAD Plan Designing", desc: "2D floor plans, sections, and working drawings.", icon: "🖥️", lessons: 12, image: courseAutocad },
  { id: "sketchup", title: "SketchUp 3D Designing", desc: "3D models and walkthroughs for clients.", icon: "📦", lessons: 10, image: courseSketchup },
  { id: "d5", title: "D5 Render — Photo & Video", desc: "Photorealistic renders and cinematic walkthroughs.", icon: "🎬", lessons: 8, image: courseD5 },
  { id: "ai", title: "AI Rendering — Photo & Video", desc: "AI tools for instant high-quality renders.", icon: "🤖", lessons: 8, image: courseAi },
  { id: "workflow", title: "Design-to-Execution Workflow", desc: "Bridge design and real-world construction.", icon: "⚡", lessons: 14, image: courseWorkflow },
  { id: "client", title: "Client & Site Management", desc: "Handle clients, BOQs, and projects.", icon: "👥", lessons: 10, image: courseClient },
];

export default function CoursesTab() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasPaid = profile?.has_paid || profile?.has_trial;

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      try {
        if (typeof window !== "undefined" && (window as any).fbq) {
          // As requested: mark the start of trial as a Purchase for pixel optimization
          (window as any).fbq('track', 'Purchase', { value: '10.00', currency: 'USD' });
        }
      } catch (e) {
        console.error("FB Pixel error", e);
      }
      
      // Clean up the URL query parameter so it doesn't fire again on refresh
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        {hasPaid ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="h-20 w-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-6">
              <GraduationCap className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">Your Courses Are Ready</h1>
            <p className="text-muted-foreground text-sm font-medium mb-8 max-w-md">
              Access all 6 professional courses — AutoCAD, SketchUp, D5 Render, AI Rendering, Workflow & Client Management.
            </p>
            <a
              href={COURSES_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-gold-lg"
            >
              <GraduationCap className="h-5 w-5" />
              Get Courses
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 sm:mb-10">
              <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Course Progress</p>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">My Courses</h1>
              <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">
                Upgrade to unlock all software & execution courses.
              </p>
            </div>

            <div className="premium-card shadow-glass-lg !p-4 sm:!p-6 mb-6 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 border-accent/20">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-accent" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-black text-foreground text-sm uppercase tracking-wide mb-1">Courses are currently locked</p>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Start your free trial to unlock all 6 courses + weekly new content.</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/payment")}
                className="btn-gold px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest flex-shrink-0 w-full sm:w-auto">
                Unlock Everything
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COURSES.map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    "premium-card !p-6 transition-all card-hover",
                    "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-4 -mt-1">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-2xl bg-muted/30 h-10 w-10 rounded-xl flex items-center justify-center border-t border-border/20">{course.icon}</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border-t border-border/20">
                      <Lock className="h-3 w-3" />Locked
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-sm leading-tight uppercase tracking-tight">{course.title}</h3>
                  <p className="text-[11px] font-medium text-muted-foreground mb-6 uppercase tracking-tight leading-relaxed">{course.desc}</p>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.lessons} lessons · Unlock to access</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}