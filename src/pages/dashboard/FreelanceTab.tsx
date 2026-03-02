import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Briefcase, MapPin, DollarSign, CheckCircle, Loader2, Clock, Search, Lock, Link2, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FreelanceProject {
  id: string;
  title: string;
  budget: string;
  location: string;
  description: string;
  created_at: string;
}

export default function FreelanceTab() {
  const { user, profile } = useAuth();
  const isEnrolled = profile?.has_paid === true;
  const [showLockedDialog, setShowLockedDialog] = useState(false);
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Portfolio apply dialog
  const [applyProject, setApplyProject] = useState<FreelanceProject | null>(null);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);
  const [applySubmitting, setApplySubmitting] = useState(false);

  const MAX_DAILY_INTERESTS = 2;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [{ data: projects }, { data: myInterests }, { data: todayInterests }] = await Promise.all([
        supabase.from("freelance_projects").select("*").order("created_at", { ascending: false }),
        supabase.from("freelance_interests").select("project_id").eq("student_id", user.id),
        supabase.from("freelance_interests").select("id").eq("student_id", user.id).gte("created_at", todayStart.toISOString()),
      ]);
      setProjects(projects || []);
      setInterests((myInterests || []).map((i) => i.project_id));
      setTodayCount((todayInterests || []).length);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const openApplyDialog = (project: FreelanceProject) => {
    setApplyProject(project);
    setPortfolioLinks([""]);
  };

  const addPortfolioLink = () => {
    if (portfolioLinks.length < 4) {
      setPortfolioLinks([...portfolioLinks, ""]);
    }
  };

  const removePortfolioLink = (index: number) => {
    if (portfolioLinks.length > 1) {
      setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
    }
  };

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  };

  const submitApplication = async () => {
    if (!user || !applyProject) return;

    const validLinks = portfolioLinks.filter(l => l.trim().length > 0);
    if (validLinks.length === 0) {
      toast({ title: "Please add at least one portfolio link", variant: "destructive" });
      return;
    }

    if (todayCount >= MAX_DAILY_INTERESTS) {
      toast({ title: "Daily limit reached", description: "You can apply to only 2 jobs per day. Try again tomorrow!", variant: "destructive" });
      return;
    }

    setApplySubmitting(true);

    // Save interest with portfolio links in the message content
    const { error } = await supabase.from("freelance_interests").insert({
      student_id: user.id,
      project_id: applyProject.id,
    });

    if (error) {
      toast({ title: "Already applied to this project", variant: "destructive" });
    } else {
      // Send portfolio links as a message for admin review
      await supabase.from("messages").insert({
        sender_id: user.id,
        content: `[Job Application: ${applyProject.title}]\nPortfolio links:\n${validLinks.map((l, i) => `${i + 1}. ${l}`).join("\n")}`,
        is_broadcast: false,
      });

      setInterests((prev) => [...prev, applyProject.id]);
      setTodayCount((c) => c + 1);
      toast({
        title: "Application submitted",
        description: "Your profile is being reviewed. We'll notify you once verified.",
      });
    }

    setApplySubmitting(false);
    setApplyProject(null);
  };

  const remaining = MAX_DAILY_INTERESTS - todayCount;

  const filtered = projects.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-3">Community freelance board</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2 tracking-tight">Real projects, real clients, real pay</h1>
          <p className="text-muted-foreground text-xs sm:text-[13px] font-medium">Apply to design projects posted by clients worldwide. Submit your portfolio, get verified, and start earning.</p>
        </div>

        {/* Daily limit badge + search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border-t ${remaining > 0 ? "bg-accent/5 text-accent border-accent/10" : "bg-red-500/5 text-red-500 border-red-500/10"}`}>
            <Clock className="h-3 w-3" />
            {remaining > 0 ? `${remaining} application${remaining === 1 ? "" : "s"} left today` : "Daily limit reached — try tomorrow"}
          </div>
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-full text-xs bg-muted/30 border-border/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">{search ? "No jobs match your search" : "No opportunities posted yet"}</p>
            <p className="text-sm mt-1">Check back soon for new design opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filtered.map((proj) => {
              const applied = interests.includes(proj.id);
              const daysAgo = Math.floor((Date.now() - new Date(proj.created_at).getTime()) / 86400000);
              return (
                <div key={proj.id} className="premium-card !p-5 sm:!p-6 shadow-glass card-hover transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center flex-shrink-0 btn-gold shadow-gold group-hover:scale-110 transition-transform duration-500">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {daysAgo <= 2 && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/5 px-2 py-1 rounded-full border-t border-green-500/10">New</span>
                      )}
                      {applied && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/5 px-2 py-1 rounded-full border-t border-amber-500/10">
                          <ShieldCheck className="h-3 w-3" />Verifying
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-black text-foreground mb-1.5 text-xs sm:text-sm uppercase tracking-tight">{proj.title}</h3>
                  <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground mb-4 leading-relaxed line-clamp-2">{proj.description}</p>

                  <div className="flex flex-wrap gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-5">
                    <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-lg border-t border-border/20">
                      <DollarSign className="h-3 w-3 text-accent" />{proj.budget}
                    </span>
                    <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-lg border-t border-border/20">
                      <MapPin className="h-3 w-3 text-accent" />{proj.location}
                    </span>
                    <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1.5 rounded-lg border-t border-border/20">
                      <Clock className="h-3 w-3 text-accent" />{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!isEnrolled ? (
                      <button
                        onClick={() => setShowLockedDialog(true)}
                        className="flex-1 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-muted/60 text-muted-foreground border border-border/20 transition-all hover:bg-muted/80 flex items-center justify-center gap-2"
                      >
                        <Lock className="h-3.5 w-3.5" />Locked
                      </button>
                    ) : !applied ? (
                      <button
                        onClick={() => openApplyDialog(proj)}
                        disabled={remaining <= 0}
                        className="btn-gold flex-1 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white shadow-gold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        Apply Now
                      </button>
                    ) : (
                      <div className="flex-1 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center justify-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" />Verification in progress
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-8 font-medium">
          Showing {filtered.length} of {projects.length} opportunities
        </p>
      </div>

      {/* Apply with Portfolio Dialog */}
      <Dialog open={!!applyProject} onOpenChange={(o) => !o && setApplyProject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 h-11 w-11 rounded-full bg-accent/10 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-accent" />
            </div>
            <DialogTitle className="text-sm font-black uppercase tracking-tight text-center">Submit your portfolio</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-center leading-relaxed">
              Applying for: <span className="font-semibold text-foreground">{applyProject?.title}</span>
              <br />
              Add up to 4 portfolio links (Behance, Dribbble, personal site, etc.) so our team can review your work and verify your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {portfolioLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={`Portfolio link ${i + 1}`}
                    value={link}
                    onChange={(e) => updatePortfolioLink(i, e.target.value)}
                    className="pl-9 h-10 rounded-xl text-xs"
                  />
                </div>
                {portfolioLinks.length > 1 && (
                  <button
                    onClick={() => removePortfolioLink(i)}
                    className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {portfolioLinks.length < 4 && (
              <button
                onClick={addPortfolioLink}
                className="w-full py-2.5 rounded-xl border border-dashed border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent hover:border-accent/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3 w-3" /> Add another link
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-1">
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              After you apply, our team will verify your portfolio before you can connect with the client. We'll notify you once you're approved.
            </p>
          </div>

          <Button
            onClick={submitApplication}
            disabled={applySubmitting || portfolioLinks.every(l => !l.trim())}
            className="w-full btn-gold text-white font-black text-[11px] uppercase tracking-widest rounded-full h-11 mt-1"
          >
            {applySubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Submit application
          </Button>
        </DialogContent>
      </Dialog>

      {/* Locked Dialog */}
      <Dialog open={showLockedDialog} onOpenChange={setShowLockedDialog}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <DialogTitle className="text-sm font-black uppercase tracking-tight">Only for Active Students</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Design job opportunities are exclusively available for enrolled students. Complete your enrollment to unlock access to real client projects and start earning.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowLockedDialog(false)}
            className="w-full btn-gold text-white font-black text-[11px] uppercase tracking-widest rounded-full h-11"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
