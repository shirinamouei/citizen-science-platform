"use client";

import { useSyncExternalStore } from "react";
import { isSignedInNow, subscribeAuthChange } from "@/lib/auth-context";

/* Client-only mock storage for the prototype: no backend yet, so drafts and
   uploads live in localStorage when the user is signed in. Guest submissions
   are kept in memory only -- never written to localStorage -- so they don't
   survive a reload once the person walks away without an account. */

export type DraftEntry = {
  id: string;
  date: string;
  med: string;
  dose: string;
  notes: string;
};

export type UploadEntry = {
  id: string;
  date: string;
  med: string;
  dose: string;
  notes: string;
  status: "synced" | "pending";
};

const DRAFTS_KEY = "tt_drafts";
const UPLOADS_KEY = "tt_uploads";
const EMPTY_DRAFTS: DraftEntry[] = [];
const EMPTY_UPLOADS: UploadEntry[] = [];

// Cached snapshots so useSyncExternalStore gets a stable reference until data
// actually changes (it re-parses localStorage on every write, not every read).
let draftsCache: DraftEntry[] | null = null;
let uploadsCache: UploadEntry[] | null = null;

// Guest (unauthenticated) data lives only here -- a plain module variable
// resets naturally on reload, so it's never remembered across page loads.
let guestDrafts: DraftEntry[] = [];
let guestUploads: UploadEntry[] = [];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// When sign-in state changes, drop the persisted caches so the next read
// re-hydrates from localStorage (or, for a fresh guest, sees nothing).
subscribeAuthChange(() => {
  draftsCache = null;
  uploadsCache = null;
  notify();
});

function readPersisted<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function getDraftsSnapshot(): DraftEntry[] {
  if (!isSignedInNow()) return guestDrafts;
  if (draftsCache === null) draftsCache = readPersisted<DraftEntry>(DRAFTS_KEY);
  return draftsCache;
}

function getUploadsSnapshot(): UploadEntry[] {
  if (!isSignedInNow()) return guestUploads;
  if (uploadsCache === null) uploadsCache = readPersisted<UploadEntry>(UPLOADS_KEY);
  return uploadsCache;
}

function writeDrafts(value: DraftEntry[]) {
  if (isSignedInNow()) {
    draftsCache = value;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(value));
  } else {
    guestDrafts = value;
  }
  notify();
}

function writeUploads(value: UploadEntry[]) {
  if (isSignedInNow()) {
    uploadsCache = value;
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(value));
  } else {
    guestUploads = value;
  }
  notify();
}

export function useDrafts() {
  return useSyncExternalStore(subscribe, getDraftsSnapshot, () => EMPTY_DRAFTS);
}

export function useUploads() {
  return useSyncExternalStore(subscribe, getUploadsSnapshot, () => EMPTY_UPLOADS);
}

export function saveDraft(entry: Omit<DraftEntry, "id">) {
  const draft: DraftEntry = { ...entry, id: crypto.randomUUID() };
  writeDrafts([draft, ...getDraftsSnapshot()]);
  return draft;
}

export function discardDraft(id: string) {
  writeDrafts(getDraftsSnapshot().filter((draft) => draft.id !== id));
}

export function addUpload(entry: Omit<UploadEntry, "id">) {
  const upload: UploadEntry = { ...entry, id: crypto.randomUUID() };
  writeUploads([upload, ...getUploadsSnapshot()]);
  return upload;
}

export function deleteUpload(id: string) {
  writeUploads(getUploadsSnapshot().filter((upload) => upload.id !== id));
}

/** Moves a draft into the upload history and removes it from drafts. */
export function promoteDraft(id: string) {
  const draft = getDraftsSnapshot().find((d) => d.id === id);
  if (!draft) return;

  writeDrafts(getDraftsSnapshot().filter((d) => d.id !== id));

  const upload: UploadEntry = {
    id: draft.id,
    date: draft.date,
    med: draft.med,
    dose: draft.dose,
    notes: draft.notes,
    status: "synced",
  };
  writeUploads([upload, ...getUploadsSnapshot()]);
}
