import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Award, Download, Lock } from "lucide-react";

interface Certificate {
  id: string;
  course_name: string;
  issue_date: string;
  certificate_url: string;
}

export default function CertificatesTab() {
  const { profile, user } = useAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", user.id)
        .order("issue_date", { ascending: false });
      setCerts(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const hasPaid = profile?.has_paid;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-10">
          <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-2 sm:mb-4">Achievements</p>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tight">Certificates</h1>
          <p className="text-muted-foreground text-[11px] sm:text-[13px] font-medium italic">
            {hasPaid ? "Your earned certificates will appear here." : "Complete the program to earn certificates."}
          </p>
        </div>

        {!hasPaid ? (
          <div className="text-center py-20 premium-card !p-12 border-accent/20">
            <div className="h-20 w-20 rounded-3xl bg-accent/5 flex items-center justify-center mx-auto mb-8 border-t border-accent/20">
              <Lock className="h-8 w-8 text-accent" />
            </div>
            <p className="text-accent text-[10px] font-black tracking-[0.2em] uppercase mb-4">Locked Achievement</p>
            <h3 className="font-black text-white text-2xl mb-4 tracking-tight uppercase">Unlock Your Certification</h3>
            <p className="text-muted-foreground text-[13px] font-medium max-w-sm mx-auto leading-relaxed border-t border-white/5 pt-6 mt-6 uppercase tracking-tight">
              Certificates are awarded upon completion of each module. Enroll in the program to begin your journey.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted/50 animate-pulse" />)}
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-20">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
            <p className="font-medium text-foreground">No certificates yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete your courses to earn certificates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {certs.map((cert) => (
              <div key={cert.id} className="premium-card !p-0 overflow-hidden shadow-glass group">
                {/* Certificate preview */}
                <div className="h-36 bg-gradient-to-br from-muted/50 to-muted/10 flex items-center justify-center relative border-b border-white/5">
                  <div className="text-center">
                    <div className="h-16 w-16 btn-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-gold group-hover:scale-110 transition-transform duration-500">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">ID Verified</p>
                  </div>
                  <div className="absolute top-3 right-3 text-2xl">🏆</div>
                </div>
                <div className="p-6">
                  <h3 className="font-black text-foreground mb-1.5 text-sm uppercase tracking-tight">{cert.course_name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">
                    Issued: {new Date(cert.issue_date).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
                  </p>
                  {cert.certificate_url ? (
                    <a
                      href={cert.certificate_url}
                      download
                      className="flex items-center gap-2 text-accent text-[11px] font-black uppercase tracking-widest hover:text-accent/80 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">PDF being prepared...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
