import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setIsAdmin(false);
      return false;
    }

    try {
      const roleQuery = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", nextUser.id)
        .eq("role", "admin")
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Admin role check timed out")), 4000);
      });

      const { data, error } = await Promise.race([roleQuery, timeoutPromise]);
      if (error) throw error;

      const admin = Boolean(data);
      setIsAdmin(admin);
      return admin;
    } catch (error) {
      console.error("Failed to check admin role:", error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    const nextUser = nextSession?.user ?? null;
    setUser(nextUser);
    await checkAdmin(nextUser);
  }, [checkAdmin]);

  useEffect(() => {
    let mounted = true;

    const syncAuthState = async (nextSession: Session | null) => {
      if (!mounted) return;
      setLoading(true);
      await applySession(nextSession);
      if (mounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAuthState(nextSession);
    });

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      void syncAuthState(initialSession);
    });

    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    await applySession(data.session ?? null);
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    await applySession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
