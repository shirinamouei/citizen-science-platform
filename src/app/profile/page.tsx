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
              <div className={`card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: "var(--lavender)" }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 19V10M9 19V5M14 19v-7M19 19V8" stroke="#112845" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div className={styles.statValue}>28</div>
                <div className={styles.statLabel}>Total uploads</div>
              </div>
              <div className={`card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: "#fff3e0" }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <div className={styles.statValue}>14-day</div>
                <div className={styles.statLabel}>Current streak</div>
              </div>
              <div className={`card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: "var(--blue)" }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#112845" strokeWidth="1.6" />
                    <path d="M3 9h18" stroke="#112845" strokeWidth="1.6" />
                  </svg>
                </div>
                <div className={styles.statValue}>Jul 14</div>
                <div className={styles.statLabel}>Last upload</div>
              </div>
              <div className={`card ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: "#e6f6ec" }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="#1a7f4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="#1a7f4a" strokeWidth="1.4" />
                  </svg>
                </div>
                <div className={styles.statValue}>100%</div>
                <div className={styles.statLabel}>Anonymized &amp; synced</div>
              </div>
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
                <div className={`${styles.milestone} ${styles.milestoneDone}`}>
                  <div className={styles.dot}></div>
                  <span>First upload</span>
                </div>
                <div className={`${styles.milestone} ${styles.milestoneDone}`}>
                  <div className={styles.dot}></div>
                  <span>10 uploads</span>
                </div>
                <div className={`${styles.milestone} ${styles.milestoneDone}`}>
                  <div className={styles.dot}></div>
                  <span>7-day streak</span>
                </div>
                <div className={styles.milestone}>
                  <div className={styles.dot}></div>
                  <span>50 uploads</span>
                </div>
                <div className={styles.milestone}>
                  <div className={styles.dot}></div>
                  <span>90-day streak</span>
                </div>
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
