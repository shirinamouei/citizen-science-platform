"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

/* Client-only mock auth for the prototype: no backend yet, so "signing in"
   just records a validated email locally. Swap this for real session/auth
   calls once an auth provider is wired up. */

type AuthContextValue = {
  isSignedIn: boolean;
  email: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "tt_auth_email";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

/** Plain (non-hook) read of sign-in state, for use outside React components. */
export function isSignedInNow() {
  return typeof window !== "undefined" && !!localStorage.getItem(STORAGE_KEY);
}

/** Subscribe to sign-in/out events from outside React, e.g. other client stores. */
export function subscribeAuthChange(callback: () => void) {
  return subscribe(callback);
}

function signIn(email: string) {
  localStorage.setItem(STORAGE_KEY, email);
  listeners.forEach((listener) => listener());
}

function signOut() {
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const email = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <AuthContext.Provider value={{ isSignedIn: !!email, email, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
