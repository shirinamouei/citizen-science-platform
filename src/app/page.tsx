import Link from "next/link";
import QrDownload from "@/components/QrDownload";
import styles from "./home.module.css";

const walkthroughSteps = [
  { title: "You log a dose", description: "Write a quick journal entry about your taper." },
  { title: "Securely uploaded", description: "One click sends it through an encrypted upload." },
  { title: "Anonymized", description: "Identifying details are stripped before anything is stored." },
  { title: "Joins the dataset", description: "Your entry joins hundreds of anonymous contributions." },
];

const howItWorksSteps = [
  { title: "Create a profile", description: "Choose an anonymous or named profile." },
  { title: "Log your taper", description: "Enter medication, dose, and tapering notes as you go." },
  { title: "We strip identifiers", description: "Personal details are removed before data is aggregated." },
  { title: "Data helps others", description: "Aggregated trends inform research and future patients." },
];

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div>
            <h1>Your tapering data can help the next person taper safer.</h1>
            <p className="lede mt-16">
              Bring your tapering data together, no matter the format. Donate data to support 
              research and future tapering patients while tracking your own
              progress.
            </p>
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

          <div className={styles.walkthrough} aria-label="Animated walkthrough: log a dose, upload it securely, anonymize it, and it joins the dataset">
            <div className={styles.walkthroughStage} aria-hidden="true">
              {/* Phase 1: write a journal entry */}
              <div className={`${styles.phase} ${styles.phase1}`}>
                <div className={styles.journalCard}>
                  <div className={styles.journalDate}>
                    <span className={`${styles.typeLine} ${styles.typeDate}`}>Aug 2, 2026</span>
                  </div>
                  <div className={styles.journalBody}>
                    <span className={`${styles.typeLine} ${styles.typeLine1}`}>Day 12 of taper — 37.5mg dose today.</span>
                    <span className={`${styles.typeLine} ${styles.typeLine2}`}>Mild dizziness this morning, better now.</span>
                    <span className={`${styles.typeLine} ${styles.typeLine3}`}>
                      Sleep and appetite both back to normal.
                      <span className={styles.cursor}></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Phase 2: securely uploaded */}
              <div className={`${styles.phase} ${styles.phase2}`}>
                <div className={styles.journalCardMini}>
                  <div className={styles.journalDate}>Aug 2, 2026</div>
                  <div className={styles.journalSnippet}>Day 12 of taper — 37.5mg dose today. Mild dizziness this morning...</div>
                </div>
                <div className={`btn btn-primary ${styles.mockUploadBtn}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M12 3v9m0-9l-3.5 3.5M12 3l3.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Upload Data
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill}></div>
                </div>
              </div>

              {/* Phase 3: anonymized */}
              <div className={`${styles.phase} ${styles.phase3}`}>
                <div className={styles.checkBadge}>
                  <svg viewBox="0 0 24 24" width="42" height="42" fill="none">
                    <path d="M6 12.5l4 4 8-9" stroke="#1a7f4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={styles.anonLabel}>No identifying information included</div>
              </div>

              {/* Phase 4: joins the dataset */}
              <div className={`${styles.phase} ${styles.phase4}`}>
                <div className={styles.datasetList}>
                  <div className={`${styles.datasetRow} ${styles.datasetRowNew}`}>
                    <span className={styles.datasetDot}></span>
                    Aug 2, 2026 · Anonymous contributor
                  </div>
                  <div className={`${styles.datasetRow} ${styles.datasetRowOld}`}>Jul 29, 2026 · Anonymous contributor</div>
                  <div className={`${styles.datasetRow} ${styles.datasetRowOld}`}>Jul 24, 2026 · Anonymous contributor</div>
                  <div className={`${styles.datasetRow} ${styles.datasetRowOld}`}>Jul 18, 2026 · Anonymous contributor</div>
                </div>
              </div>
            </div>

            <div className={styles.walkthroughCaption}>
              {walkthroughSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`${styles.captionItem} ${styles["caption" + (index + 1)]}`}
                >
                  <h3>
                    <span className={styles.captionStepNum}>{index + 1}</span>
                    {step.title}
                  </h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>

            <div className={styles.captionDots} aria-hidden="true">
              {walkthroughSteps.map((step, index) => (
                <span
                  key={step.title}
                  className={`${styles.dot} ${styles["dot" + (index + 1)]}`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QR / APP DOWNLOAD */}
      <section className="section-tight">
        <div className="wrap">
          <div className={styles.qrSection}>
            <div>
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

      {/* HOW IT WORKS */}
      <section className="section-tight">
        <div className="wrap">
          <div className="text-center mb-48">
            <h2>Four steps. Two minutes.</h2>
          </div>
          <div className={styles.stepsStrip}>
            {howItWorksSteps.map((step, index) => (
              <div className={`card ${styles.stepCard}`} key={step.title}>
                <div className={styles.stepNum}>{index + 1}</div>
                <h3>{step.title}</h3>
                <p className="text-muted-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOG IN OR CONTINUE AS GUEST */}
      <section className="section-tight">
        <div className="wrap">
          <div className="text-center mb-48">
            <h2>Sign in, or dive right in as a guest</h2>
          </div>
          <div className={styles.accessGrid}>
            <div className={`card ${styles.accessCard}`}>
              <div className={styles.accessIcon} style={{ background: "var(--lavender)" }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#112845" strokeWidth="1.6" />
                  <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Log in to upload data</h3>
              <p className="text-muted-sm">Create an account to save your history and sync it across devices.</p>
              <Link href="/signin" className="btn btn-primary mt-16">
                Sign In
              </Link>
            </div>
            <div className={`card ${styles.accessCard}`}>
              <div className={styles.accessIcon} style={{ background: "#fff3e0" }}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path d="M12 5c-5 0-8 4-8 4s3 4 8 4 8-4 8-4-3-4-8-4z" stroke="#FF9500" strokeWidth="1.6" strokeLinejoin="round" />
                  <circle cx="12" cy="9" r="2" stroke="#FF9500" strokeWidth="1.6" />
                </svg>
              </div>
              <h3>Continue as a guest</h3>
              <p className="text-muted-sm">Upload data anonymously right away, no account needed.</p>
              <Link href="/upload" className="btn btn-secondary mt-16">
                Continue as Guest
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION BRIEF */}
      <section className="section-tight">
        <div className="wrap">
          <div className={styles.missionBrief}>
            <h2>Tapering off medication shouldn&apos;t rely on guesswork.</h2>
            <p className="lede mt-16" style={{ maxWidth: "520px", margin: "16px auto 0", textAlign: "center" }}>
              Your data, combined with hundreds of others, helps researchers and future
              patients taper more safely.
            </p>
            <Link href="/about" className="btn btn-secondary mt-24">
              Read more about our mission
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
