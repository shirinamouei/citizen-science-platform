import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | Cascade",
};

export default function NotFound() {
  return (
    <main>
      <section className={styles.notFoundSection}>
        <div className={`wrap ${styles.notFoundInner}`}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            Lost your place
          </div>
          <div className={styles.code}>404</div>
          <h1>This page didn&apos;t make it into the dataset.</h1>
          <p className="lede">
            The page you&apos;re looking for may have moved or never existed. Let&apos;s get
            you back to somewhere useful.
          </p>
          <div className={styles.actions}>
            <Link href="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link href="/upload" className="btn btn-secondary">
              Log tapering data
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
