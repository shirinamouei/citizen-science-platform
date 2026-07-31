import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us | TaperTrack",
};

export default function AboutPage() {
  return (
    <main>
      <section className={styles.aboutHero}>
        <div className="wrap">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            Our mission
          </div>
          <h1>Tapering off medication shouldn&apos;t rely on guesswork.</h1>
          <p className="lede">
            Tapering data is often scattered across notebooks, PDFs, spreadsheets, and chat
            logs. TaperTrack brings it into one place, and you can choose to donate it to
            support research.
          </p>
        </div>

        <div className="wrap">
          <div className={styles.missionBand}>
            <div className="eyebrow">Why TaperTrack exists</div>
            <h2>
              Bring together your diary entries, PDFs, spreadsheets, and AI chat logs into one
              place. Donate it anonymously to help the next person taper with more confidence.
            </h2>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="text-center mb-48">
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              What we stand for
            </div>
            <h2>The principles behind the platform</h2>
          </div>
          <div className={styles.valueGrid}>
            <div className={`card ${styles.valueCard}`}>
              <div className={styles.valueIcon} style={{ background: "var(--lavender)" }}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z"
                    stroke="#112845"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <h3>Consent first</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                Every contribution is opt-in. Nothing is required to use the app.
              </p>
            </div>
            <div className={`card ${styles.valueCard}`}>
              <div className={styles.valueIcon} style={{ background: "#fff3e0" }}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#FF9500" strokeWidth="1.6" />
                </svg>
              </div>
              <h3>Privacy by default</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                Identifying details are removed before your data reaches a researcher.
              </p>
            </div>
            <div className={`card ${styles.valueCard}`}>
              <div className={styles.valueIcon} style={{ background: "var(--blue)" }}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3 3 8l9 5 9-5-9-5z"
                    stroke="#112845"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M3 12l9 5 9-5" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 16l9 5 9-5" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Any format, one place</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "8px" }}>
                Handwritten notes, PDFs, spreadsheets, even AI chat exports. We organize whatever
                you already have into one view of your taper.
              </p>
            </div>
          </div>

          <div className={styles.storyGrid}>
            <div>
              <div className="eyebrow">Where this started</div>
              <h2>Built after watching taper data go nowhere</h2>
              <p className="lede mt-16" style={{ maxWidth: "520px" }}>
                Tapering is often a solitary process, and the tools people use to track it
                (notes apps, spreadsheets, AI assistants, notebooks) rarely talk to each other.
                TaperTrack brings that record into one place, so you get a clear picture of your
                taper. You can also choose to donate it anonymously to help the next person.
              </p>
            </div>
            <div className={styles.storyVisual}>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"
                  stroke="#112845"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className={`card ${styles.teamNote}`}>
            <h3>A note on medical advice</h3>
            <p>
              TaperTrack is a personal tracking and data-sharing platform, not a medical
              provider. Talk to a healthcare professional before changing how you take any
              medication.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
