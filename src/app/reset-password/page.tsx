"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import styles from "../signin/signin.module.css";

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isSignedIn, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = password === confirmPassword;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) return;

    setError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/profile");
    } finally {
      setSubmitting(false);
    }
  }

  // Clicking the emailed link signs the visitor in via a short-lived
  // recovery session — supabase-js parses it from the URL automatically on
  // load. No session at this point means the link is missing, already used,
  // or expired, so there's nothing to reset against.
  const linkInvalid = !loading && !isSignedIn;

  return (
    <main>
      <section className={styles.authSection}>
        <div className={`wrap ${styles.authCardOuter}`}>
          <div className={styles.authIntro}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              Reset your password
            </div>
            <h1 style={{ fontSize: "clamp(24px, 7vw, 32px)" }}>Choose a new password</h1>
          </div>

          <div className={`card ${styles.authCard}`}>
            {loading ? (
              <p className={styles.authSub}>Checking your reset link…</p>
            ) : linkInvalid ? (
              <>
                <h2>This link is invalid or has expired</h2>
                <p className={styles.authSub}>
                  Password reset links only work once and expire after a while. Request a new
                  one to continue.
                </p>
                <Link href="/forgot-password" className="btn btn-primary" style={{ width: "100%" }}>
                  Request a new link
                </Link>
              </>
            ) : (
              <>
                <h2>Set a new password</h2>
                <p className={styles.authSub}>Choose something you haven&apos;t used before.</p>
                <form onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label>New password</label>
                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={password && !passwordValid ? styles.inputError : ""}
                    />
                    {password && !passwordValid && (
                      <p className={styles.errorText}>
                        Password must be at least {MIN_PASSWORD_LENGTH} characters.
                      </p>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label>Confirm new password</label>
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={confirmPassword && !passwordsMatch ? styles.inputError : ""}
                    />
                    {confirmPassword && !passwordsMatch && (
                      <p className={styles.errorText}>Passwords don&apos;t match.</p>
                    )}
                  </div>
                  {error && <p className={styles.errorText}>{error}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    disabled={submitting || !passwordValid || !passwordsMatch}
                  >
                    {submitting ? "Saving…" : "Save new password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
