import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "manager";
  is_active: boolean;
}

interface StaffAuthContextValue {
  staffUser: StaffUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextValue | undefined>(undefined);

async function fetchStaffRow(userId: string): Promise<StaffUser | null> {
  const { data, error } = await supabase
    .from("staff")
    .select("id, email, full_name, role, is_active")
    .eq("id", userId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as StaffUser;
}

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        if (mounted) {
          setStaffUser(null);
          setLoading(false);
        }
        return;
      }

      const staff = await fetchStaffRow(session.user.id);
      if (!staff) {
        await supabase.auth.signOut();
        if (mounted) {
          setStaffUser(null);
          setLoading(false);
        }
        return;
      }

      if (mounted) {
        setStaffUser(staff);
        setLoading(false);
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setStaffUser(null);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const staff = await fetchStaffRow(session.user.id);
        if (!staff) {
          await supabase.auth.signOut();
          setStaffUser(null);
        } else {
          setStaffUser(staff);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: unknown }> {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { error };
    }

    if (!data.session) {
      setLoading(false);
      return { error: new Error("No session returned after sign-in") };
    }

    const staff = await fetchStaffRow(data.session.user.id);
    if (!staff) {
      await supabase.auth.signOut();
      setLoading(false);
      return { error: new Error("Account not found or inactive. Access denied.") };
    }

    setStaffUser(staff);
    setLoading(false);
    return { error: null };
  }

  async function signOut(): Promise<void> {
    setLoading(true);
    await supabase.auth.signOut();
    setStaffUser(null);
    setLoading(false);
  }

  const isAdmin = staffUser?.role === "admin";

  return (
    <StaffAuthContext.Provider value={{ staffUser, loading, signIn, signOut, isAdmin }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth(): StaffAuthContextValue {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return ctx;
}
