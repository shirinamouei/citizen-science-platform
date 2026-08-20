"use client";

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth-context";

/* Signed-in entries are read from and written to Supabase (RLS scopes every
   row to auth.uid()). Guest submissions are anonymous inserts into `entries`
   — write-only by policy, so there's nothing to read back. We keep a local,
   in-memory list of what a guest submitted this session purely so the page
   can show it to them before they navigate away; it's never persisted and
   resets on reload. */

export type MedicationRecord = { name: string; startingDose?: string; currentDose?: string };

export type UploadEntry = {
  id: string;
  date: string;
  med: string;
  dose: string;
  notes: string;
  status: "synced" | "pending";
};

export type CollectedEntry = { medications: MedicationRecord[]; notes: string };

const EMPTY_UPLOADS: UploadEntry[] = [];

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

function rowToUpload(row: EntryRow): UploadEntry {
  const { med, dose } = summarizeMedications(row.medications ?? []);
  return { id: row.id, date: formatDate(row.created_at), med, dose, notes: row.notes || "N/A", status: row.status };
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

/** Uploads to the private `entry-attachments` bucket under a path scoped to
 * the owning user (or `guest/` for anonymous submissions) and returns the
 * storage path to store alongside the entry row. */
async function uploadAttachment(id: string, userId: string | null, file: File, extension: string) {
  const path = `${userId ?? "guest"}/${id}${extension}`;
  const { error } = await supabase.storage.from("entry-attachments").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function addUpload(entry: CollectedEntry, attachment?: { file: File; extension: string } | null) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;
  const id = crypto.randomUUID();

  const attachmentPath = attachment ? await uploadAttachment(id, userId, attachment.file, attachment.extension) : null;

  const payload = {
    id,
    user_id: userId,
    medications: entry.medications,
    notes: entry.notes || null,
    status: "synced" as const,
    age_verified: true,
    attachment_path: attachmentPath,
  };

  // Guest rows are write-only under RLS (nobody can read another guest's
  // anonymous submission back, including the submitter) — so there's no row
  // to select after insert. Build the confirmation entry from what we
  // already know instead of reading it back.
  if (!userId) {
    const { error } = await supabase.from("entries").insert(payload);
    if (error) throw error;
    const upload = rowToUpload({
      id,
      created_at: new Date().toISOString(),
      medications: entry.medications,
      notes: entry.notes || null,
      status: "synced",
    });
    guestUploads = [upload, ...guestUploads];
    notify();
    return upload;
  }

  const { data, error } = await supabase
    .from("entries")
    .insert(payload)
    .select("id, created_at, medications, notes, status")
    .single();
  if (error) throw error;

  const upload = rowToUpload(data);
  uploadsCache = [upload, ...uploadsCache];
  notify();
  return upload;
}

export async function deleteUpload(id: string) {
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
  uploadsCache = uploadsCache.filter((upload) => upload.id !== id);
  notify();
}
