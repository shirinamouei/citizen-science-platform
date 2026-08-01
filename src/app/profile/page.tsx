"use client";

import { useRouter } from "next/navigation";
import ContributionChart from "@/components/ContributionChart";
import { useAuth } from "@/lib/auth-context";
import styles from "./profile.module.css";

const historyRows = [
  { date: "Jul 14, 2026", med: "Sertraline", dose: "37.5 mg", notes: "Mild dizziness, day 2", status: "synced" as const },
  { date: "Jul 7, 2026", med: "Sertraline", dose: "40 mg", notes: "N/A", status: "synced" as const },
  { date: "Jun 30, 2026", med: "Sertraline", dose: "42.5 mg", notes: "Slept well", status: "synced" as const },
  { date: "Jun 23, 2026", med: "Sertraline", dose: "45 mg", notes: "N/A", status: "pending" as const },
  { date: "Jun 16, 2026", med: "Sertraline", dose: "47.5 mg", notes: "Mild nausea", status: "synced" as const },
];

const stats = [
  {
    background: "var(--lavender)",
    value: "28",
    label: "Total uploads",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 19V10M9 19V5M14 19v-7M19 19V8" stroke="#112845" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    background: "#fff3e0",
    value: "14-day",
    label: "Current streak",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    background: "var(--blue)",
    value: "Jul 14",
    label: "Last upload",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#112845" strokeWidth="1.6" />
        <path d="M3 9h18" stroke="#112845" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    background: "#e6f6ec",
    value: "100%",
    label: "Anonymized & synced",
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="#1a7f4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9" stroke="#1a7f4a" strokeWidth="1.4" />
      </svg>
    ),
  },
];

const milestones = [
  { label: "First upload", done: true },
  { label: "10 uploads", done: true },
  { label: "7-day streak", done: true },
  { label: "50 uploads", done: false },
  { label: "90-day streak", done: false },
];

function StatCard({
  icon,
  background,
  value,
  label,
}: {
  icon: React.ReactNode;
  background: string;
  value: string;
  label: string;
}) {
  return (
    <div className={`card ${styles.statCard}`}>
      <div className={styles.statIcon} style={{ background }}>
        {icon}
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function Milestone({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`${styles.milestone} ${done ? styles.milestoneDone : ""}`}>
      <div className={styles.dot}></div>
      <span>{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { isSignedIn, email, signOut } = useAuth();
  const isGuest = !isSignedIn;
  const router = useRouter();

  return (
    <>
      <main>
        <section className={styles.profileHero}>
          <div className="wrap">
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>JM</div>
              <div>
                <div className={styles.profileName}>
                  Jordan M.{" "}
                  {isGuest && (
                    <span className="guest-pill" style={{ display: "inline-flex" }}>
                      <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                        <path d="M12 9v4M12 16.5v.01" stroke="#b8690a" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="9" stroke="#b8690a" strokeWidth="1.4" />
                      </svg>
                      Guest, information not saved
                    </span>
                  )}
                </div>
                <div className={styles.profileSub}>
                  Contributor since Feb 2026 &nbsp;·&nbsp; Tracking: Sertraline
                  {isSignedIn && email && <>&nbsp;·&nbsp; {email}</>}
                </div>
              </div>
              {isSignedIn && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                >
                  Sign out
                </button>
              )}
            </div>

            <div className={styles.statRow}>
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className={styles.chartSection}>
              <div className={`card ${styles.chartCard}`}>
                <div className={styles.chartCardHead}>
                  <h3>Your contributions over time</h3>
                  <div className={styles.chartTabs}>
                    <button className={styles.active}>Monthly</button>
                    <button>Weekly</button>
                  </div>
                </div>
                <ContributionChart />
              </div>

              <div className={`card ${styles.streakCard}`}>
                <div className={styles.streakFlame}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2c1 3-2 4-2 7a4 4 0 008 0c0-2-1-3-1-3s1 4-2 4-1-4-1-4-2 2-2 4a4 4 0 008 0c0-5-4-6-4-8-3 2-4 5-4 8 0 0-4-3-4-8z"
                      fill="white"
                    />
                  </svg>
                </div>
                <h3>Milestones</h3>
                {milestones.map((milestone) => (
                  <Milestone key={milestone.label} {...milestone} />
                ))}
              </div>
            </div>

            <div className={`card ${styles.historyCard}`}>
              <h3 className="mb-16">Upload history</h3>
              <table className={styles.history}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Medication</th>
                    <th>Dose</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.med}</td>
                      <td>{row.dose}</td>
                      <td>{row.notes}</td>
                      <td>
                        <span
                          className={`${styles.statusChip} ${
                            row.status === "synced" ? styles.statusChipSynced : styles.statusChipPending
                          }`}
                        >
                          {row.status === "synced" ? "Synced" : "Processing"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
