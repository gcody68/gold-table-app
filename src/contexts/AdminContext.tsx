import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type AdminContextType = {
  isAdmin: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, restaurantName: string) => Promise<{ error: string | null }>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAdmin(!!data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setIsAdmin(!!s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      await supabase
        .from("restaurant_settings")
        .update({ owner_id: data.session.user.id })
        .is("owner_id", null);
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, restaurantName: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { restaurant_name: restaurantName } },
    });
    if (error) return { error: error.message };
    if (data.session) {
      await supabase.from("restaurant_settings").insert({
        business_name: restaurantName,
        owner_id: data.session.user.id,
      });
    }
    return { error: null };
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <AdminContext.Provider value={{ isAdmin, session, login, signUp, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
