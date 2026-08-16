"use client";

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

/* Signed-in drafts/entries are read from and written to Supabase (RLS scopes
   every row to auth.uid()). Guest submissions are anonymous inserts into
   `entries` — write-only by policy, so there's nothing to read back. We keep
   a local, in-memory list of what a guest submitted this session purely so
   the page can show it to them before they navigate away; it's never
   persisted and resets on reload. */

export type MedicationRecord = { name: string; startingDose?: string; currentDose?: string };

export type DraftEntry = { id: string; date: string; med: string; dose: string; notes: string };

export type UploadEntry = {
  id: string;
  date: string;
  med: string;
  dose: string;
  notes: string;
  status: "synced" | "pending";
};

export type CollectedEntry = { medications: MedicationRecord[]; notes: string };

const EMPTY_DRAFTS: DraftEntry[] = [];
const EMPTY_UPLOADS: UploadEntry[] = [];

let draftsCache: DraftEntry[] = [];
let uploadsCache: UploadEntry[] = [];
let guestUploads: UploadEntry[] = [];

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((listener) => listener());
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function summarizeMedications(meds: MedicationRecord[]) {
  const names = meds.map((m) => m.name).filter(Boolean);
  const doses = meds
    .map((m) => {
      if (m.startingDose && m.currentDose) return `${m.startingDose}mg → ${m.currentDose}mg`;
      const only = m.startingDose || m.currentDose;
      return only ? `${only}mg` : "";
    })
    .filter(Boolean);
  return {
    med: names.length ? names.join(", ") : "Untitled entry",
    dose: doses.length ? doses.join(", ") : "—",
  };
}

// The DB rows only carry `medications`/`notes`; display fields are derived.
type EntryRow = { id: string; created_at: string; medications: MedicationRecord[]; notes: string | null; status: "synced" | "pending" };
type DraftRow = { id: string; updated_at: string; medications: MedicationRecord[]; notes: string | null };

function rowToUpload(row: EntryRow): UploadEntry {
  const { med, dose } = summarizeMedications(row.medications ?? []);
  return { id: row.id, date: formatDate(row.created_at), med, dose, notes: row.notes || "N/A", status: row.status };
}

function rowToDraft(row: DraftRow): DraftEntry {
  const { med, dose } = summarizeMedications(row.medications ?? []);
  return { id: row.id, date: formatDate(row.updated_at), med, dose, notes: row.notes || "N/A" };
}

async function refreshUploads() {
  const { data, error } = await supabase
    .from("entries")
    .select("id, created_at, medications, notes, status")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load uploads:", error.message);
    return;
  }
  uploadsCache = (data ?? []).map(rowToUpload);
  notify();
}

async function refreshDrafts() {
  const { data, error } = await supabase
    .from("drafts")
    .select("id, updated_at, medications, notes")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Failed to load drafts:", error.message);
    return;
  }
  draftsCache = (data ?? []).map(rowToDraft);
  notify();
}

/** Re-fetches from Supabase when sign-in state changes; clears local caches on sign-out. */
export function useUploads() {
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (isSignedIn) refreshUploads();
    else {
      uploadsCache = [];
      notify();
    }
  }, [isSignedIn]);
  return useSyncExternalStore(subscribe, () => (isSignedIn ? uploadsCache : guestUploads), () => EMPTY_UPLOADS);
}

export function useDrafts() {
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (isSignedIn) refreshDrafts();
    else {
      draftsCache = [];
      notify();
    }
  }, [isSignedIn]);
  return useSyncExternalStore(subscribe, () => (isSignedIn ? draftsCache : EMPTY_DRAFTS), () => EMPTY_DRAFTS);
}

export async function addUpload(entry: CollectedEntry) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;

  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: userId,
      medications: entry.medications,
      notes: entry.notes || null,
      status: "synced",
      age_verified: true,
    })
    .select("id, created_at, medications, notes, status")
    .single();
  if (error) throw error;

  const upload = rowToUpload(data);
  if (userId) uploadsCache = [upload, ...uploadsCache];
  else guestUploads = [upload, ...guestUploads];
  notify();
  return upload;
}

export async function saveDraft(entry: CollectedEntry) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("You must be signed in to save a draft.");

  const { data, error } = await supabase
    .from("drafts")
    .insert({ user_id: userId, medications: entry.medications, notes: entry.notes || null })
    .select("id, updated_at, medications, notes")
    .single();
  if (error) throw error;

  const draft = rowToDraft(data);
  draftsCache = [draft, ...draftsCache];
  notify();
  return draft;
}

export async function discardDraft(id: string) {
  const { error } = await supabase.from("drafts").delete().eq("id", id);
  if (error) throw error;
  draftsCache = draftsCache.filter((draft) => draft.id !== id);
  notify();
}

export async function deleteUpload(id: string) {
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
  uploadsCache = uploadsCache.filter((upload) => upload.id !== id);
  notify();
}

/** Moves a draft into the upload history and removes it from drafts. */
export async function promoteDraft(id: string) {
  const { data: draftRow, error: fetchError } = await supabase
    .from("drafts")
    .select("medications, notes")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("You must be signed in to promote a draft.");

  const { data: entryRow, error: insertError } = await supabase
    .from("entries")
    .insert({
      user_id: userId,
      medications: draftRow.medications,
      notes: draftRow.notes,
      status: "synced",
      age_verified: true,
    })
    .select("id, created_at, medications, notes, status")
    .single();
  if (insertError) throw insertError;

  const { error: deleteError } = await supabase.from("drafts").delete().eq("id", id);
  if (deleteError) throw deleteError;

  draftsCache = draftsCache.filter((draft) => draft.id !== id);
  uploadsCache = [rowToUpload(entryRow), ...uploadsCache];
  notify();
}
