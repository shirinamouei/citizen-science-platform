"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthResult = { error: string | null; needsEmailConfirmation?: boolean };

type AuthContextValue = {
  isSignedIn: boolean;
  loading: boolean;
  email: string | null;
  signInWithPassword: (email: string, password: string, captchaToken: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, preferredName: string, captchaToken: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function ensureProfile(session: Session) {
  const { user } = session;
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return;

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    preferred_name: (user.user_metadata?.preferred_name as string | undefined) ?? null,
  });
  if (error) console.error("Failed to create profile row:", error.message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) ensureProfile(data.session);
    });

    // Only SIGNED_IN needs a profile check (covers sign-up with confirmation
    // disabled, and sign-in after confirming by email) — TOKEN_REFRESHED fires
    // hourly for every active tab and would otherwise re-run this needlessly.
    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_IN" && newSession) ensureProfile(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signInWithPassword(email: string, password: string, captchaToken: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });
    return { error: error?.message ?? null };
  }

  async function signUp(
    email: string,
    password: string,
    preferredName: string,
    captchaToken: string
  ): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { preferred_name: preferredName }, captchaToken },
    });
    if (error) return { error: error.message };
    return { error: null, needsEmailConfirmation: !data.session };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!session,
        loading,
        email: session?.user.email ?? null,
        signInWithPassword,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
