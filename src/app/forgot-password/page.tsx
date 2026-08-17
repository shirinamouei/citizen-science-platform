"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "../signin/signin.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // Lands on /reset-password once that page exists to let the user set a
      // new password; until then Supabase will still send the email, the
      // link just won't have anywhere to go yet.
      const redirectTo = `${window.location.origin}${window.location.pathname.replace(
        /\/forgot-password\/?$/,
        "/reset-password"
      )}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setError(error.message);
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className={styles.authSection}>
        <div className={`wrap ${styles.authCardOuter}`}>
          <div className={styles.authIntro}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              Reset your password
            </div>
            <h1 style={{ fontSize: "clamp(24px, 7vw, 32px)" }}>Forgot your password?</h1>
            <p className="lede" style={{ margin: "12px auto 0", textAlign: "center" }}>
              Enter the email on your account and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          <div className={`card ${styles.authCard}`}>
            {sent ? (
              <>
                <h2>Check your email</h2>
                <p className={styles.authSub}>
                  If an account exists for <strong>{email}</strong>, a password reset link is on
                  its way.
                </p>
              </>
            ) : (
              <>
                <h2>Reset password</h2>
                <p className={styles.authSub}>
                  We&apos;ll email you a secure link — your password is never sent by email.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className={styles.errorText}>{error}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    disabled={submitting}
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              </>
            )}

            <div className={styles.authFooterLink}>
              <Link href="/signin">Back to sign in</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
