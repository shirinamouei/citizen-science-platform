"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function Turnstile({ onVerify }: { onVerify: (token: string | null) => void }) {
  const containerId = useId();
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set — CAPTCHA cannot render.");
      return;
    }
    let cancelled = false;
    loadTurnstileScript().then(() => {
      if (cancelled) return;
      const container = document.getElementById(containerId);
      if (!container || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onVerify(null),
        "error-callback": () => onVerify(null),
      });
    });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;
  return <div id={containerId} />;
}
