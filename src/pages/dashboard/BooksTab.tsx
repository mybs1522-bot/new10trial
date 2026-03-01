import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Lock, BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import bookKitchen from "@/assets/book-kitchen.jpg";
import bookWashroom from "@/assets/book-washroom.jpg";
import bookStudy from "@/assets/book-study.jpg";
import bookBedroom from "@/assets/book-bedroom.jpg";
import bookLiving from "@/assets/book-living.jpg";
import bookElevations from "@/assets/book-elevations.jpg";

const BOOKS_LINK = "https://docs.google.com/document/d/1pRBJtlofVRHgOU3vDXGpflp0cXPX58OttsoY4pq-RRg/edit?tab=t.0";

const BOOKS = [
  { id: "kitchen", title: "How to Design Kitchen", emoji: "🍳", image: bookKitchen, color: "from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30" },
  { id: "washroom", title: "How to Design Washroom", emoji: "🚿", image: bookWashroom, color: "from-blue-50 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-950/30" },
  { id: "study", title: "How to Design Study", emoji: "📚", image: bookStudy, color: "from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30" },
  { id: "bedroom", title: "How to Design Bedroom", emoji: "🛏️", image: bookBedroom, color: "from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-950/30" },
  { id: "living", title: "How to Design Living Room", emoji: "🛋️", image: bookLiving, color: "from-rose-50 to-pink-100 dark:from-rose-950/30 dark:to-pink-950/30" },
  { id: "exteriors", title: "How to Design Exteriors", emoji: "🏡", image: bookElevations, color: "from-sky-50 to-indigo-100 dark:from-sky-950/30 dark:to-indigo-950/30" },
];

export default function BooksTab() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const hasPaid = profile?.has_paid || profile?.has_trial;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        {hasPaid ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="h-20 w-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">Your Books Are Ready</h1>
            <p className="text-muted-foreground text-sm font-medium mb-8 max-w-md">
              Access all 6 premium design guides — Kitchen, Washroom, Study, Bedroom, Living Room & Exteriors.
            </p>
            <a
              href={BOOKS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-10 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-gold-lg"
            >
              <BookOpen className="h-5 w-5" />
              Read Books
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6 sm:mb-10">
              <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Resource Center</p>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Books Library</h1>
              <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">
                Unlock all 6 premium design books instantly.
              </p>
            </div>

            <div className="premium-card shadow-glass-lg !p-4 sm:!p-6 mb-6 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 border-accent/20">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-accent" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-black text-foreground text-sm uppercase tracking-wide mb-1">Library access is locked</p>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">Get full PDF access to all 6 premium design guides upon enrollment.</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/payment")}
                className="btn-gold px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest flex-shrink-0 w-full sm:w-auto">
                Unlock All Books
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BOOKS.map((book) => (
                <div
                  key={book.id}
                  className={cn(
                    "premium-card !p-8 group relative overflow-hidden card-hover transition-all text-left",
                    "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden mb-4 -mt-2">
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="relative">
                    <h3 className="font-bold text-foreground mb-2 text-sm leading-tight uppercase tracking-tight">{book.title}</h3>
                    <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-6">Execution Guide • PDF</p>
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Enrol to Unlock</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 text-foreground/50" />
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