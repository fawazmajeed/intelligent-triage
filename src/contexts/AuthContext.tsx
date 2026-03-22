import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Organization {
  id: string;
  name: string;
  trial_expires_at: string;
  is_licensed: boolean;
  license_key: string | null;
}

interface UserProfile {
  id: string;
  auth_id: string;
  email: string;
  organization_id: string;
  preferred_currency: string;
  standard_triage_minutes: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  organization: Organization | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isTrialExpired: boolean;
  trialDaysLeft: number;
  isLicensed: boolean;
  isReadOnly: boolean;
  signOut: () => Promise<void>;
  refreshOrg: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (authId: string) => {
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (userData) {
      setUserProfile(userData as UserProfile);

      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", userData.organization_id)
        .single();

      if (orgData) {
        setOrganization(orgData as Organization);
      }
    }
  };

  const refreshOrg = async () => {
    if (user) await fetchUserData(user.id);
  };

  const refreshProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setOrganization(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const now = new Date();
  const trialEnd = organization ? new Date(organization.trial_expires_at) : now;
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isTrialExpired = trialDaysLeft === 0;
  const isLicensed = organization?.is_licensed ?? false;
  const isReadOnly = isTrialExpired && !isLicensed;

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setOrganization(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user, session, organization, userProfile, loading,
        isTrialExpired, trialDaysLeft, isLicensed, isReadOnly,
        signOut, refreshOrg, refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
