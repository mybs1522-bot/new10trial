import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar, MapPin, Clock, CalendarPlus, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SiteVisit {
  id: string;
  title: string;
  location: string;
  visit_date: string;
  visit_time: string;
  description: string;
}

type RsvpStatus = "coming" | "not_coming" | null;

export default function CalendarTab() {
  const { user, profile } = useAuth();
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  const isOffline = profile?.mode === "offline";

  useEffect(() => {
    const fetchData = async () => {
      const { data: visitData } = await supabase
        .from("site_visits")
        .select("*")
        .order("visit_date", { ascending: true });
      setVisits(visitData || []);

      if (user) {
        const { data: rsvpData } = await supabase
          .from("site_visit_rsvp")
          .select("visit_id, status")
          .eq("student_id", user.id);
        const map: Record<string, RsvpStatus> = {};
        (rsvpData || []).forEach((r) => { map[r.visit_id] = r.status as RsvpStatus; });
        setRsvps(map);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleRsvp = async (visitId: string, status: "coming" | "not_coming") => {
    if (!user) return;
    setRsvpLoading(visitId);

    const existing = rsvps[visitId];

    try {
      if (existing === status) {
        // Toggle off — delete
        await supabase
          .from("site_visit_rsvp")
          .delete()
          .eq("student_id", user.id)
          .eq("visit_id", visitId);
        setRsvps((prev) => { const next = { ...prev }; next[visitId] = null; return next; });
        toast.success("RSVP removed.");
      } else if (existing) {
        // Update existing
        await supabase
          .from("site_visit_rsvp")
          .update({ status })
          .eq("student_id", user.id)
          .eq("visit_id", visitId);
        setRsvps((prev) => ({ ...prev, [visitId]: status }));
        toast.success(status === "coming" ? "Great! Marked as attending." : "Noted — marked as not attending.");
      } else {
        // Insert new
        await supabase
          .from("site_visit_rsvp")
          .insert({ student_id: user.id, visit_id: visitId, status });
        setRsvps((prev) => ({ ...prev, [visitId]: status }));
        toast.success(status === "coming" ? "Great! Marked as attending." : "Noted — marked as not attending.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setRsvpLoading(null);
    }
  };

  const addToCalendar = (visit: SiteVisit) => {
    const startDate = visit.visit_date.replace(/-/g, "") + "T" + visit.visit_time.replace(/:/g, "") + "00";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(visit.title)}&dates=${startDate}/${startDate}&details=${encodeURIComponent(visit.description)}&location=${encodeURIComponent(visit.location)}`;
    window.open(url, "_blank");
  };

  // For online (non-offline) users who haven't paid, show locked message
  if (!isOffline && !profile?.has_paid) {
    const firstName = profile?.full_name?.split(" ")[0] || "there";
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-10">
            <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Field Learning</p>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Site Visits</h1>
            <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">Hands-on visits to real project sites across Delhi/NCR.</p>
          </div>
          <div className="relative overflow-hidden premium-card !p-10 text-center"
            style={{ background: "linear-gradient(135deg, hsl(38 62% 10%) 0%, hsl(220 20% 6%) 100%)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(38 62% 61% / 0.4), transparent)" }} />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl mx-auto mb-6 flex items-center justify-center btn-gold">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-4">You're on the list</p>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Hello {firstName}, 👋</h2>
              <p className="text-white/70 text-base font-medium mb-4 leading-relaxed">
                You'll be informed about our next site visit well in advance.
              </p>
              <p className="text-white/40 text-xs font-medium max-w-sm mx-auto leading-relaxed uppercase tracking-wider">
                Come at your own convenience — no pressure. We'll send you the details before every visit.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Field Learning</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Site Visit Calendar</h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">Scheduled real-site visits for hands-on learning experience.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No site visits scheduled yet</p>
            <p className="text-sm mt-1">Check back soon — admin will schedule upcoming visits.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => {
              const isPast = new Date(visit.visit_date) < new Date();
              const myRsvp = rsvps[visit.id];
              const isLoadingThis = rsvpLoading === visit.id;

              return (
                <div
                  key={visit.id}
                  className={cn(
                    "premium-card !p-6 transition-all",
                    isPast ? "opacity-60 grayscale-[0.5]" : "shadow-glass card-hover"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-5">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 border-t border-border/20",
                        isPast ? "bg-muted" : "btn-gold"
                      )}>
                        <Calendar className={cn("h-5 w-5", isPast ? "text-muted-foreground" : "text-white")} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-foreground text-sm uppercase tracking-tight">{visit.title}</h3>
                          {isPast && <span className="text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground px-2 py-1 rounded-md border-t border-border/20">Past</span>}
                          {!isPast && <span className="text-[10px] font-black uppercase tracking-widest bg-green-500/5 text-green-500 px-2 py-1 rounded-md border-t border-green-500/10">Upcoming</span>}
                        </div>
                        <div className="flex flex-wrap gap-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-accent" />Delhi NCR</span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-accent" />
                            {new Date(visit.visit_date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} · {visit.visit_time}
                          </span>
                        </div>
                        {visit.description && (
                          <p className="text-[11px] font-medium text-muted-foreground mt-3 uppercase tracking-tight leading-relaxed">{visit.description}</p>
                        )}
                      </div>
                    </div>

                    {!isPast && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {/* RSVP buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRsvp(visit.id, "coming")}
                            disabled={isLoadingThis}
                            className={cn(
                              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full border-t transition-all",
                              myRsvp === "coming"
                                ? "bg-green-500 text-white border-green-400"
                                : "text-green-600 border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Attending
                          </button>
                          <button
                            onClick={() => handleRsvp(visit.id, "not_coming")}
                            disabled={isLoadingThis}
                            className={cn(
                              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full border-t transition-all",
                              myRsvp === "not_coming"
                                ? "bg-destructive text-white border-red-400"
                                : "text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                            )}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Declined
                          </button>
                        </div>
                        <button
                          onClick={() => addToCalendar(visit)}
                          className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-t border-border/20 bg-muted/20 px-4 py-2.5 rounded-full hover:bg-muted/40 transition-all"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                          Add to Calendar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
