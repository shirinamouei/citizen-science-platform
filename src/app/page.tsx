import Link from "next/link";
import QrDownload from "@/components/QrDownload";
import styles from "./home.module.css";

export default function Home() {
  return (
    <>
      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={`wrap ${styles.heroGrid}`}>
            <div>
              <div className="eyebrow">Community-powered research</div>
              <h1>Your tapering data can help the next person taper safer.</h1>
              <p className="lede mt-16">
                Bring your tapering data together, no matter the format. Track your own
                progress, and optionally donate it to support research and future patients.
              </p>
              <div className={styles.heroActions}>
                <Link href="/upload" className="btn btn-primary">
                  Upload your data
                </Link>
                <Link href="/about" className="btn btn-secondary">
                  Why we do this
                </Link>
              </div>
              <div className={styles.heroStats}>
                <div>
                  <strong>100%</strong>
                  <span>Voluntary &amp; anonymized</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>Data ever sold</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Export or delete anytime</span>
                </div>
              </div>
            </div>

            <div className={styles.stage} aria-label="Animation showing how uploading data works">
              <div className={styles.stageCaption}>How your upload travels</div>
              <div className={styles.flow}>
                <div className={styles.track}></div>
                <div className={styles.pulseDot}></div>
                <div className={styles.step}>
                  <div className={`${styles.node} ${styles.step1}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 2h4a1 1 0 011 1v2h-6V3a1 1 0 011-1z" stroke="#112845" strokeWidth="1.6" />
                      <rect x="6" y="5" width="12" height="16" rx="3" stroke="#112845" strokeWidth="1.6" />
                      <path d="M9 12h6M9 15h4" stroke="#FF9500" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className={styles.nodeLabel}>You log a dose</span>
                </div>
                <div className={styles.step}>
                  <div className={`${styles.node} ${styles.step2}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3v10" stroke="#FF9500" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M8 9l4-4 4 4" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="4" y="14" width="16" height="7" rx="2" stroke="#112845" strokeWidth="1.6" />
                    </svg>
                  </div>
                  <span className={styles.nodeLabel}>Securely uploaded</span>
                </div>
                <div className={styles.step}>
                  <div className={`${styles.node} ${styles.step3}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19a4 4 0 010-8 5 5 0 019.6-1.8A4.5 4.5 0 0118.5 18H7" stroke="#112845" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M9 5.5a3 3 0 015.8-1" stroke="#FF9500" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className={styles.nodeLabel}>Anonymized</span>
                </div>
                <div className={styles.step}>
                  <div className={`${styles.node} ${styles.step4}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 19V10M9 19V5M14 19v-7M19 19V8" stroke="#112845" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M4 19h16" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className={styles.nodeLabel}>Joins the dataset</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section-tight">
          <div className="wrap">
            <div className="text-center mb-48">
              <div className="eyebrow" style={{ justifyContent: "center" }}>
                Simple by design
              </div>
              <h2>Four steps. Two minutes.</h2>
            </div>
            <div className={styles.stepsStrip}>
              <div className={`card ${styles.stepCard}`}>
                <div className={styles.stepNum}>1</div>
                <h3>Create a profile</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                  Choose an anonymous or named profile.
                </p>
              </div>
              <div className={`card ${styles.stepCard}`}>
                <div className={styles.stepNum}>2</div>
                <h3>Log your taper</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                  Enter medication, dose, and schedule as you go.
                </p>
              </div>
              <div className={`card ${styles.stepCard}`}>
                <div className={styles.stepNum}>3</div>
                <h3>We strip identifiers</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                  Personal details are removed before data is aggregated.
                </p>
              </div>
              <div className={`card ${styles.stepCard}`}>
                <div className={styles.stepNum}>4</div>
                <h3>Data helps others</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                  Aggregated trends inform research and future patients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QR / APP DOWNLOAD */}
        <section className="section-tight">
          <div className="wrap">
            <div className={styles.qrSection}>
              <div>
                <div className="eyebrow" style={{ color: "var(--gold)" }}>
                  Take it with you
                </div>
                <h2>Get the TaperTrack app</h2>
                <p>
                  Log doses in seconds and get gentle reminders, right from your phone. Scan to
                  download.
                </p>
                <div className={styles.storeBadges}>
                  <div className={styles.storeBadge}>App Store</div>
                  <div className={styles.storeBadge}>Google Play</div>
                </div>
              </div>
              <QrDownload />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
