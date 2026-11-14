import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Us",
  description: "Why Cascade exists, how it protects your data, and the research it supports.",
};

const values = [
  {
    background: "var(--lavender)",
    title: "Consent first",
    description: "Every contribution is opt-in. Nothing is required to donate data.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="#FF9500" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    background: "#e3f1fc",
    title: "Any format, one place",
    description:
      "Handwritten notes, PDFs, spreadsheets, even AI chat exports, we organize whatever you already have into one view.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M12 3 3 8l9 5 9-5-9-5z" stroke="#112845" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 12l9 5 9-5" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16l9 5 9-5" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const resources = [
  {
    name: "The Maudsley Deprescribing Guidelines",
    href: "https://www.amazon.com/dp/111982298X",
    description: "A textbook on how to taper off different drugs.",
  },
  {
    name: "Benzodiazepine Information Coalition",
    href: "https://www.benzoinfo.com/",
    description: "General information and tapering resources specific to benzodiazepines.",
  },
  {
    name: "Antidepressant Coalition for Education",
    href: "https://antidepressantinfo.org/",
    description: "Education about antidepressants and coming off them.",
  },
  {
    name: "Surviving Antidepressants",
    href: "https://www.survivingantidepressants.org/",
    description:
      "A peer support forum. It is now read-only and not accepting new members, but it holds a large collection of patient narratives.",
  },
  {
    name: "Inner Compass Initiative",
    href: "https://www.theinnercompass.org/",
    description: "Many resources, including tapering information.",
  },
  {
    name: "Outro Health on YouTube",
    href: "https://www.youtube.com/channel/UCp9aQJ_U5Lq04O-3eVz6r9g",
    description: "Educational videos about psychiatric drugs and how to safely stop them.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero" style={{ paddingBottom: "48px" }}>
        <div className="wrap">
          <h1>Tapering off medication shouldn&apos;t rely on guesswork.</h1>
          <p className="lede mt-16">
            Cascade exists so you can donate your tapering data to support research and
            future patients. If yours is scattered across notebooks, PDFs, spreadsheets,
            and chat logs, create an account to bring it into one place.
          </p>
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <p className="eyebrow">
              Our mission
            </p>
            <h2>Donate your tapering data to support research and help improve the safety of future tapering patients.</h2>
            <p className="lede">
              With an account, bring together your diary entries, PDFs, spreadsheets, and AI chat
              logs into one place.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className={styles.sectionHead}>
            <p className="eyebrow">
              Principles
            </p>
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
        </div>
      </section>

      <section className={styles.band}>
        <div className="wrap">
          <div className={styles.sectionHead}>
            <p className="eyebrow">
              Our story
            </p>
            <h2>Built after watching patients taper without guidance or support.</h2>
            <p className="lede">
              Cascade was built in the pursuit of consolidating tapering data across various groups
              of people for various medications and conditions. This data, whether it be from
              journals, notes apps, or spreadsheets, will support academic research to make tapering
              psychiatric medication less uncertain and help future patients feel supported.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className={styles.sectionHead}>
            <p className="eyebrow">
              Learn more
            </p>
            <h2>Want to learn more about tapering?</h2>
            <p className="lede">
              These independent resources cover tapering and withdrawal in more depth. They are
              shared for your information and are not affiliated with Cascade.
            </p>
          </div>
          <ul className={styles.resourceList}>
            {resources.map((resource) => (
              <li className={`card ${styles.resourceCard}`} key={resource.name}>
                <a href={resource.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                  {resource.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <p className="text-muted-sm">{resource.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className={styles.teamNote}>
            <div className={styles.teamNoteIcon}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" stroke="#FF9500" strokeWidth="1.6" />
                <path d="M12 11v5.5" stroke="#FF9500" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="7.75" r="1" fill="#FF9500" />
              </svg>
            </div>
            <div>
              <h2 className="heading-sm">A note on medical advice</h2>
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
