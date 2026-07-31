import type { Metadata } from "next";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy | TaperTrack",
};

export default function PrivacyPage() {
  return (
    <main>
      <section className={styles.legalHero}>
        <div className="wrap">
          <div className="eyebrow">Transparency, plainly stated</div>
          <h1 style={{ fontSize: "38px" }}>How we handle your data</h1>
          <p className="lede mt-16">
            No legal jargon that hides what actually happens. Here&apos;s exactly what we
            collect, why, and the controls you have over it.
          </p>
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: "32px" }}>
        <div className={`wrap ${styles.legalLayout}`}>
          <aside className={styles.toc}>
            <div className={`card ${styles.tocCard}`}>
              <a href="#what-we-collect">What we collect</a>
              <a href="#why">Why we collect it</a>
              <a href="#anonymization">How we anonymize</a>
              <a href="#storage">Storage &amp; security</a>
              <a href="#sharing">Who sees it</a>
              <a href="#control">Your controls</a>
              <a href="#rights">Your rights</a>
            </div>
          </aside>

          <div className={styles.legalBody}>
            <span className={`pill ${styles.updatedPill}`}>Last updated July 2026</span>

            <h2 id="what-we-collect">What we collect</h2>
            <p>
              When you choose to contribute, we collect the tapering information you enter:
              medication name, dose amounts, schedule dates, taper method, and any optional
              notes about symptoms or experience. If you upload a file, we extract only the
              relevant tapering fields from it.
            </p>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Data type</th>
                  <th>Collected?</th>
                  <th>Linked to your identity?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Medication &amp; dose schedule</td>
                  <td>Yes</td>
                  <td>No, after processing</td>
                </tr>
                <tr>
                  <td>Symptom notes</td>
                  <td>Only if you add them</td>
                  <td>No, after processing</td>
                </tr>
                <tr>
                  <td>Name / email</td>
                  <td>Only for your login</td>
                  <td>Kept separate from tapering data</td>
                </tr>
                <tr>
                  <td>Device / location</td>
                  <td>No</td>
                  <td>N/A</td>
                </tr>
              </tbody>
            </table>

            <h2 id="why">Why we collect it</h2>
            <p>
              Tapering off prescription medication is often poorly documented in clinical
              literature. Real-world schedules, including cases that didn&apos;t go smoothly,
              help researchers and clinicians understand what safer tapering actually looks
              like. Your data, combined anonymously with others&apos;, becomes part of that
              evidence base.
            </p>

            <h2 id="anonymization">How we anonymize your data</h2>
            <p>Before your entry is added to the shared dataset, we remove:</p>
            <ul>
              <li>Your name, email, and any account identifiers</li>
              <li>
                Free-text notes are screened and stripped of anything that could identify you
                (names, locations, providers)
              </li>
              <li>Timestamps are generalized to the week, not the exact date and time</li>
            </ul>
            <div className={styles.callout}>
              Your profile page still shows your <em>own</em> full history so you can track
              your progress. Anonymization happens only when data joins the shared research
              dataset.
            </div>

            <h2 id="storage">Storage &amp; security</h2>
            <p>
              Data is encrypted in transit and at rest. Access to identifiable account
              information is limited to a small technical team, and the anonymized research
              dataset is stored separately from account data entirely.
            </p>

            <h2 id="sharing">Who sees it</h2>
            <p>
              Aggregated, anonymized data may be shared with qualified researchers and
              clinicians studying medication tapering. We do not sell data to advertisers,
              insurers, or employers, and we never share identifiable information without your
              explicit, separate consent.
            </p>

            <h2 id="control">Your controls</h2>
            <p>
              From your profile, you can export everything you&apos;ve submitted, edit past
              entries, or permanently delete your contributions, including from the anonymized
              dataset where technically possible.
            </p>

            <h2 id="rights">Your rights</h2>
            <p>
              Depending on where you live, you may have the right to access, correct, or delete
              your personal data, and to withdraw consent at any time. Contact us at{" "}
              <strong>privacy@tapertrack.app</strong> for any request.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
