import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from "react";
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
  const [authReady, setAuthReady] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  const loading = useMemo(() => !authReady || roleLoading, [authReady, roleLoading]);

  useEffect(() => {
    let mounted = true;

    const applyAuthState = (nextSession: Session | null) => {
      if (!mounted) return;

      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        setIsAdmin(false);
        setRoleLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applyAuthState(nextSession);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        applyAuthState(initialSession);
      })
      .catch((error) => {
        console.error("Failed to restore session:", error);
        if (mounted) {
          setAuthReady(true);
          setRoleLoading(false);
          setIsAdmin(false);
        }
      });

    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        setAuthReady(true);
        setRoleLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    let active = true;
    setRoleLoading(true);

    const roleQuery = supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Admin role check timed out")), 4000);
    });

    void Promise.race([roleQuery, timeoutPromise])
      .then((result) => {
        if (!active) return;

        const queryResult = result as Awaited<typeof roleQuery>;
        if (queryResult.error) {
          throw queryResult.error;
        }

        setIsAdmin(Boolean(queryResult.data));
      })
      .catch((error) => {
        if (!active) return;
        console.error("Failed to check admin role:", error);
        setIsAdmin(false);
      })
      .finally(() => {
        if (active) {
          setRoleLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authReady, user?.id, session?.access_token]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setRoleLoading(false);
    setAuthReady(true);
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
