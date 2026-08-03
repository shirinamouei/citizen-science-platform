import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us | Cascade",
};

const values = [
  {
    background: "var(--lavender)",
    title: "Consent first",
    description: "Every contribution is opt-in. Nothing is required to use the app.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z"
          stroke="#112845"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    background: "#fff3e0",
    title: "Privacy by default",
    description: "Identifying details are removed before your data reaches a researcher.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#FF9500" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    background: "#e3f1fc",
    title: "Any format, one place",
    description:
      "Handwritten notes, PDFs, spreadsheets, even AI chat exports — with an account, we organize whatever you already have into one view, ready to donate.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 3 3 8l9 5 9-5-9-5z" stroke="#112845" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 12l9 5 9-5" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16l9 5 9-5" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className={styles.aboutHero}>
        <div className="wrap">
          <h1>Tapering off medication shouldn&apos;t rely on guesswork.</h1>
          <p className="lede">
            Cascade exists so you can donate your tapering data to support research and
            future patients. If yours is scattered across notebooks, PDFs, spreadsheets,
            and chat logs, create an account to bring it into one place first.
          </p>
        </div>
      </section>

      <section className={styles.missionBand}>
        <div className="wrap">
          <h2>
            Donate your tapering data anonymously to help the next person taper with more
            confidence. With an account, bring together your diary entries, PDFs,
            spreadsheets, and AI chat logs into one place first.
          </h2>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="text-center mb-48">
            <h2>The principles behind the platform</h2>
          </div>
          <div className={styles.valueGrid}>
            {values.map((value) => (
              <div className={`card ${styles.valueCard}`} key={value.title}>
                <div className={styles.valueIcon} style={{ background: value.background }}>
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p className="text-muted-sm">{value.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.storyGrid}>
            <h2>Built after watching taper data go nowhere</h2>
            <p className="lede">
              Tapering is often a solitary process, and the record of it ends up scattered
              across notes apps, spreadsheets, AI assistants, and notebooks that rarely
              talk to each other. Cascade lets you donate that record anonymously so the
              next person can taper with more confidence. Create an account first if you
              want to bring it all together into one clear picture before you do.
            </p>
          </div>

          <div className={styles.teamNote}>
            <div className={styles.teamNoteIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#FF9500" strokeWidth="1.6" />
                <path d="M12 11v5.5" stroke="#FF9500" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="7.75" r="1" fill="#FF9500" />
              </svg>
            </div>
            <div>
              <h3>A note on medical advice</h3>
              <p>
                Cascade is a data-donation platform for people tapering off medication, not a medical
                provider. Talk to a healthcare professional before changing how you take any
                medication.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
