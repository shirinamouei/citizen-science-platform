"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import styles from "./upload.module.css";

let nextId = 1;

export default function UploadPage() {
  const [medicationIds, setMedicationIds] = useState<number[]>([nextId++]);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addMedication() {
    setMedicationIds((prev) => [...prev, nextId++]);
  }

  function removeMedication(id: number) {
    setMedicationIds((prev) => prev.filter((m) => m !== id));
  }

  return (
    <>
      <main>
        <section className={styles.uploadHero}>
          <div className="wrap">
            <div className="eyebrow">Step 1 of 1, about 2 minutes</div>
            <h1 style={{ fontSize: "38px" }}>Log your tapering data</h1>
            <p className="lede mt-16">
              Share as much or as little as you&apos;re comfortable with. Anything you submit is
              stripped of identifying details before it&apos;s added to the shared dataset.
            </p>
          </div>
        </section>

        <section className="section-tight" style={{ paddingTop: "32px" }}>
          <div className={`wrap ${styles.uploadLayout}`}>
            <form
              className={`card ${styles.formCard}`}
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "12px" }}>
                Medications <span className={styles.hint}>(one entry per medication)</span>
              </label>

              <div>
                {medicationIds.map((id, index) => (
                  <div className={styles.medicationEntry} key={id}>
                    <div className={styles.medicationEntryHead}>
                      <span className={styles.medicationBadge}>Medication {index + 1}</span>
                      {medicationIds.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeMedBtn}
                          onClick={() => removeMedication(id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className={styles.fieldRow}>
                      <div className={styles.field}>
                        <label>Medication name</label>
                        <input type="text" placeholder="e.g. Sertraline" required />
                      </div>
                      <div className={styles.field}>
                        <label>
                          Starting dose <span className={styles.hint}>(mg)</span>
                        </label>
                        <input type="number" placeholder="e.g. 100" required />
                      </div>
                    </div>
                    <div className={styles.fieldRow}>
                      <div className={styles.field}>
                        <label>Taper start date</label>
                        <input type="date" />
                      </div>
                      <div className={styles.field}>
                        <label>Taper method</label>
                        <select>
                          <option>Direct / linear reduction</option>
                          <option>Hyperbolic reduction</option>
                          <option>Alternating dose</option>
                          <option>Liquid titration</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.addMedBtn} onClick={addMedication}>
                + Add another medication
              </button>

              <div className={styles.field}>
                <label>
                  Symptoms / notes <span className={styles.hint}>(optional)</span>
                </label>
                <textarea placeholder="Anything you noticed during this period..." />
              </div>

              <div className={styles.field}>
                <label>
                  Attach a file <span className={styles.hint}>(pharmacy printout, spreadsheet, or CSV, optional)</span>
                </label>
                <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V4M12 4L7 9M12 4l5 5" stroke="#112845" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="#112845" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  <strong>Drop a file here or click to browse</strong>
                  <span>CSV, XLSX, or PDF, up to 10MB</span>
                  <input ref={fileInputRef} type="file" style={{ display: "none" }} />
                </div>
              </div>

              <div className={styles.consentBox}>
                <input type="checkbox" required />
                <span>
                  I understand my data will be anonymized and used in aggregate for research
                  purposes, per the{" "}
                  <Link href="/privacy" style={{ textDecoration: "underline", color: "var(--navy)" }}>
                    Privacy Policy
                  </Link>
                  . I can request deletion at any time.
                </span>
              </div>

              <div className={`${styles.submitRow} mt-24`}>
                <button type="submit" className="btn btn-primary">
                  Submit data
                </button>
                <button type="button" className="btn btn-secondary">
                  Save as draft
                </button>
              </div>
              {submitted && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px", color: "#1a7f4a", fontSize: "14px", fontWeight: 600 }}>
                  ✓ Thanks. Your entry has been added to your upload history.
                </div>
              )}
            </form>

            <aside>
              <div className={`card ${styles.sideCard}`}>
                <h3>What happens to this?</h3>
                <p>Your name and contact details are never linked to your tapering data once submitted.</p>
                <ul className={styles.miniList}>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" stroke="#112845" strokeWidth="1.5" />
                    </svg>
                    Identifiers removed before storage
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" stroke="#112845" strokeWidth="1.5" />
                    </svg>
                    Used only in aggregate, never sold
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" stroke="#112845" strokeWidth="1.5" />
                    </svg>
                    Delete your contributions anytime
                  </li>
                </ul>
              </div>
              <div className={`card ${styles.sideCard}`}>
                <h3>Prefer the app?</h3>
                <p>Log doses on the go and sync automatically with your profile.</p>
                <div className={styles.badgeRow}>
                  <span className="pill">iOS</span>
                  <span className="pill">Android</span>
                </div>
                <Link href="/#qr" className="btn btn-dark mt-16" style={{ width: "100%" }}>
                  Get the app
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
