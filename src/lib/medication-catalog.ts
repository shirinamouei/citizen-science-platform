"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/* Reference data, not user data — fetched once and cached for the lifetime
   of the page; there's no need to re-fetch per component or react to auth
   state the way user-owned data does. */
let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;

async function fetchCatalog(): Promise<string[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = (async () => {
      const { data, error } = await supabase
        .from("medication_catalog")
        .select("display_name")
        .order("display_name");
      if (error) {
        console.error("Failed to load medication catalog:", error.message);
        return [];
      }
      const result = (data ?? []).map((row) => row.display_name as string);
      cache = result;
      return result;
    })();
  }
  return inflight;
}

export function useMedicationCatalog(): string[] {
  const [list, setList] = useState<string[]>(cache ?? []);
  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then((result) => {
      if (!cancelled) setList(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return list;
}
