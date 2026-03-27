import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ClientUser {
  id: string;
  auth_user_id: string;
  full_name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  google_drive_connected: boolean;
  google_drive_folder_id: string | null;
}

interface ClientAuthContextValue {
  clientUser: ClientUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: unknown }>;
  signInWithGoogle: () => Promise<{ error: unknown }>;
  signOut: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined);

async function fetchClientRow(authUserId: string): Promise<ClientUser | null> {
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, auth_user_id, full_name, business_name, email, phone, google_drive_connected, google_drive_folder_id"
    )
    .eq("auth_user_id", authUserId)
    .single();

  if (error || !data) return null;
  return data as ClientUser;
}

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        if (mounted) {
          setClientUser(null);
          setLoading(false);
        }
        return;
      }

      const client = await fetchClientRow(session.user.id);
      if (mounted) {
        setClientUser(client);
        setLoading(false);
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setClientUser(null);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        let client = await fetchClientRow(session.user.id);

        // Auto-create client record for first-time Google sign-ins
        if (!client && session.user.app_metadata?.provider === "google") {
          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              auth_user_id: session.user.id,
              full_name: session.user.user_metadata?.full_name ?? session.user.email?.split("@")[0] ?? "Client",
              email: session.user.email ?? "",
              business_name: null,
              phone: null,
              google_drive_connected: false,
            })
            .select("id, auth_user_id, full_name, business_name, email, phone, google_drive_connected, google_drive_folder_id")
            .single();
          client = newClient as ClientUser | null;
        }

        setClientUser(client);
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

    const client = await fetchClientRow(data.session.user.id);
    if (!client) {
      await supabase.auth.signOut();
      setLoading(false);
      return { error: new Error("Client account not found.") };
    }

    setClientUser(client);
    setLoading(false);
    return { error: null };
  }

  async function signInWithGoogle(): Promise<{ error: unknown }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/client-portal/dashboard`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    return { error: error ?? null };
  }

  async function signOut(): Promise<void> {
    setLoading(true);
    await supabase.auth.signOut();
    setClientUser(null);
    setLoading(false);
  }

  return (
    <ClientAuthContext.Provider value={{ clientUser, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth(): ClientAuthContextValue {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return ctx;
}
