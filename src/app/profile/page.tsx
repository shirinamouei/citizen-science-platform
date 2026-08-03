"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { discardDraft, promoteDraft, useDrafts, useUploads } from "@/lib/upload-store";
import styles from "./profile.module.css";

function buildStats(totalUploads: number, lastUpload: string) {
  return [
    {
      background: "var(--lavender)",
      value: String(totalUploads),
      label: "Total uploads",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 19V10M9 19V5M14 19v-7M19 19V8" stroke="#112845" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      background: "var(--blue)",
      value: lastUpload,
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
}

function buildMilestones(totalUploads: number) {
  return [
    { label: "First upload", done: totalUploads >= 1 },
    { label: "10 uploads", done: totalUploads >= 10 },
    { label: "7-day streak", done: false },
    { label: "50 uploads", done: totalUploads >= 50 },
    { label: "90-day streak", done: false },
  ];
}

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
  const drafts = useDrafts();
  const uploads = useUploads();
  const stats = buildStats(uploads.length, uploads[0]?.date ?? "—");
  const milestones = buildMilestones(uploads.length);

  return (
    <>
      <main>
        <section className={styles.profileHero}>
          <div className="wrap">
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {isSignedIn && email ? (
                  email[0].toUpperCase()
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                    <circle cx="12" cy="8" r="4" stroke="#112845" strokeWidth="1.6" />
                    <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" stroke="#112845" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div>
                <div className={styles.profileName}>
                  {isSignedIn && email ? email : "Guest"}{" "}
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
                  {isGuest
                    ? "Sign in to save your history across visits"
                    : uploads.length > 0
                      ? `${uploads.length} upload${uploads.length === 1 ? "" : "s"} so far`
                      : "No uploads yet"}
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
                </div>
                <div className={styles.chartEmpty}>
                  <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                    <path d="M4 19V10M9 19V5M14 19v-7M19 19V8" stroke="#a9b4c9" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <strong>No contributions yet</strong>
                  <span>Upload your first entry to start tracking your progress here.</span>
                </div>
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

            {drafts.length > 0 && (
              <div className={`card ${styles.historyCard}`}>
                <h3 className="mb-16">Drafts</h3>
                <table className={styles.history}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Medication</th>
                      <th>Dose</th>
                      <th>Notes</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((draft) => (
                      <tr key={draft.id}>
                        <td>{draft.date}</td>
                        <td>{draft.med}</td>
                        <td>{draft.dose}</td>
                        <td>{draft.notes}</td>
                        <td>
                          <div className={styles.draftActions}>
                            <button
                              type="button"
                              className={styles.draftUploadBtn}
                              onClick={() => promoteDraft(draft.id)}
                            >
                              Upload
                            </button>
                            <button
                              type="button"
                              className={styles.draftDiscardBtn}
                              onClick={() => discardDraft(draft.id)}
                            >
                              Discard
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={`card ${styles.historyCard}`}>
              <h3 className="mb-16">Upload history</h3>
              {uploads.length > 0 ? (
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
                    {uploads.map((upload) => (
                      <tr key={upload.id}>
                        <td>{upload.date}</td>
                        <td>{upload.med}</td>
                        <td>{upload.dose}</td>
                        <td>{upload.notes}</td>
                        <td>
                          <span
                            className={`${styles.statusChip} ${
                              upload.status === "synced" ? styles.statusChipSynced : styles.statusChipPending
                            }`}
                          >
                            {upload.status === "synced" ? "Synced" : "Processing"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.historyEmpty}>
                  <span>Your uploads will show up here once you submit your first entry.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
