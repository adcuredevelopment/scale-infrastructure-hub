import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from "react";
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

  const loading = useMemo(() => !authReady || (!!user && roleLoading), [authReady, roleLoading, user]);

  const checkAdmin = useCallback(async (userId: string) => {
    setRoleLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(Boolean(data));
    } catch (error) {
      console.error("Failed to check admin role:", error);
      setIsAdmin(false);
    } finally {
      setRoleLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const applyAuthState = (nextSession: Session | null) => {
      if (!mounted) return;

      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      setIsAdmin(false);
      setRoleLoading(Boolean(nextUser));
      setAuthReady(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applyAuthState(nextSession);
    });

    void supabase.auth.getSession()
      .then(({ data: { session: initialSession } }) => {
        applyAuthState(initialSession);
      })
      .catch((error) => {
        console.error("Failed to restore session:", error);
        if (mounted) {
          setAuthReady(true);
          setRoleLoading(false);
        }
      });

    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        setAuthReady(true);
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

    void checkAdmin(user.id);
  }, [authReady, user?.id, session?.access_token, checkAdmin]);

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
