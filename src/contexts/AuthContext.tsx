import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  mode: string;
  experience_level: string;
  has_paid: boolean;
  has_trial: boolean;
  has_execution_plan: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await checkAdminRole(user.id);
    }
  };

  const enqueueDrip = async (userId: string, email: string) => {
    try {
      await supabase.functions.invoke("enqueue-student-drip", {
        body: { studentId: userId, studentEmail: email },
      });
    } catch (e) {
      // Non-blocking — drip enqueue failure should not affect login
      console.warn("Drip enqueue failed:", e);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data } = await supabase.functions.invoke("check-subscription");
      if (data && !data.error) {
        // Profile will be updated server-side, just refresh
        if (user) await fetchProfile(user.id);
      }
    } catch (e) {
      console.warn("Subscription check failed:", e);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            await checkAdminRole(session.user.id);
            // Check Stripe subscription status
            try {
              const { data } = await supabase.functions.invoke("check-subscription");
              if (data && !data.error) {
                await fetchProfile(session.user.id); // re-fetch after sync
              }
            } catch (e) {
              console.warn("Subscription check failed:", e);
            }
            // Drip emails removed — only welcome + OTP emails are active
            setLoading(false);
          }, 100);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, isAdmin, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
