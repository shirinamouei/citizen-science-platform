import Link from "next/link";
import QrDownload from "@/components/QrDownload";
import WalkthroughAnimation from "@/components/WalkthroughAnimation";
import styles from "./home.module.css";

const walkthroughSteps = [
  { title: "You log a dose", description: "Write a quick journal entry about your taper." },
  { title: "Securely uploaded", description: "One click sends it through an encrypted upload." },
  { title: "Anonymized", description: "Identifying details are stripped before anything is stored." },
  { title: "Joins the dataset", description: "Your entry joins hundreds of anonymous contributions." },
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getWalkthroughDates() {
  const today = new Date();
  const todayLabel = formatDate(today);
  const priorDates = [4, 9, 15].map((daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return formatDate(d);
  });
  return { todayLabel, priorDates };
}

const howItWorksSteps = [
  { title: "Create a profile", description: "Choose an anonymous or named profile." },
  { title: "Log your taper", description: "Enter medication, dose, and tapering notes as you go." },
  { title: "We strip identifiers", description: "Personal details are removed before data is aggregated." },
  { title: "Data helps others", description: "Aggregated trends inform research and future patients." },
];

export default function Home() {
  const { todayLabel, priorDates } = getWalkthroughDates();

  return (
    <main>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div>
            <h1>
              Your tapering <span className={styles.heroHighlight}>data can help</span> the next person{" "}
              <span className={styles.heroHighlight}>taper safer</span>.
            </h1>
            <p className="lede mt-16">
              Donate your tapering data to support research and help future patients taper
              more safely. Create a free account to bring it all together first, no matter
              what format it&apos;s already in.
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

          <WalkthroughAnimation steps={walkthroughSteps} todayLabel={todayLabel} priorDates={priorDates} />
        </div>
      </section>

      {/* QR / APP DOWNLOAD */}
      <section className="section-tight">
        <div className="wrap">
          <div className={styles.qrSection}>
            <div className={styles.qrText}>
              <h2>Get the Cascade app</h2>
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
              <p className="text-muted-sm">
                Create an account to bring tapering data you have in different formats,
                like spreadsheets, PDFs, and past notes, into one place before you donate it.
              </p>
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
              <p className="text-muted-sm">Donate a single entry anonymously right away, no account needed.</p>
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
