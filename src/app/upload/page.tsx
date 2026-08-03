"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { addUpload, saveDraft } from "@/lib/upload-store";
import styles from "./upload.module.css";

let nextId = 1;

function formatToday() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const checkIcon = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M9 12l2 2 4-4" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="#112845" strokeWidth="1.5" />
  </svg>
);

const dataHandlingPoints = [
  "Identifiers removed before storage",
  "Used only in aggregate, never sold",
  "Delete your contributions anytime*",
];

export default function UploadPage() {
  const [medicationIds, setMedicationIds] = useState<number[]>([nextId++]);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function addMedication() {
    setMedicationIds((prev) => [...prev, nextId++]);
  }

  function removeMedication(id: number) {
    setMedicationIds((prev) => prev.filter((m) => m !== id));
  }

  function collectEntry() {
    const data = new FormData(formRef.current ?? undefined);
    const meds = medicationIds
      .map((id) => (data.get(`med-name-${id}`) as string)?.trim())
      .filter(Boolean);
    const doses = medicationIds
      .map((id) => (data.get(`med-dose-${id}`) as string)?.trim())
      .filter(Boolean);
    const notes = ((data.get("notes") as string) || "").trim();
    return {
      date: formatToday(),
      med: meds.length ? meds.join(", ") : "Untitled entry",
      dose: doses.length ? doses.map((d) => `${d}mg`).join(", ") : "—",
      notes: notes || "N/A",
    };
  }

  function handleSaveDraft() {
    saveDraft(collectEntry());
    setDraftSaved(true);
    setSubmitted(false);
  }

  return (
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
            ref={formRef}
            className={`card ${styles.formCard}`}
            onSubmit={(e) => {
              e.preventDefault();
              addUpload({ ...collectEntry(), status: "synced" });
              setSubmitted(true);
              setDraftSaved(false);
            }}
          >
            <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "6px" }}>
              Psychiatric medication(s) you&apos;re currently tapering
            </label>
            <p className={styles.sectionNote}>
              Please list the name of only one psychiatric medication per entry. If you&apos;re
              tapering more than one at the same time, use &ldquo;+ Add another medication&rdquo;
              below for each additional one.
            </p>

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
                      <label>
                        Medication name <span className={styles.hint}>(one medication only)</span>
                      </label>
                      <input type="text" name={`med-name-${id}`} placeholder="e.g. Sertraline" required />
                    </div>
                    <div className={styles.field}>
                      <label>
                        Starting dose <span className={styles.hint}>(mg, best estimate is fine)</span>
                      </label>
                      <input type="number" name={`med-dose-${id}`} placeholder="e.g. 100" required />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label>
                        Taper start date <span className={styles.hint}>(approximate is fine)</span>
                      </label>
                      <input type="date" />
                    </div>
                    <div className={styles.field}>
                      <label>
                        Taper method <span className={styles.hint}>(current or most recent)</span>
                      </label>
                      <select defaultValue="">
                        <option value="" disabled>
                          Select one
                        </option>
                        <option>Direct / linear reduction</option>
                        <option>Hyperbolic reduction</option>
                        <option>Alternating dose</option>
                        <option>Liquid titration</option>
                        <option>Switched methods along the way</option>
                        <option>Not sure / don&apos;t know the name</option>
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
              <textarea name="notes" placeholder="Anything you noticed during this period..." />
            </div>

            <div className={styles.field}>
              <label>
                Attach a file <span className={styles.hint}>(pharmacy printout, journal entry, spreadsheet, CSV, etc. Optional)</span>
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
                <Link href="/privacy" className="link-underline">
                  Privacy Policy
                </Link>
                . I can request deletion at any time.
              </span>
            </div>

            <div className={`${styles.submitRow} mt-24`}>
              <button type="submit" className="btn btn-primary">
                Submit data
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>
                Save as draft
              </button>
            </div>
            {submitted && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px", color: "#1a7f4a", fontSize: "14px", fontWeight: 600 }}>
                ✓ Thanks. Your entry has been added to your upload history.
              </div>
            )}
            {draftSaved && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px", color: "#b8690a", fontSize: "14px", fontWeight: 600 }}>
                ✓ Saved as a draft. You can find it on your profile page.
              </div>
            )}
          </form>

          <aside>
            <div className={`card ${styles.sideCard}`}>
              <h3>What happens to this?</h3>
              <p>Your name and contact details are never linked to your tapering data once submitted.</p>
              <ul className={styles.miniList}>
                {dataHandlingPoints.map((point) => (
                  <li key={point}>
                    {checkIcon}
                    {point}
                  </li>
                ))}
              </ul>
              <p className={styles.footnote}>
                *Deleting your contributions removes them from future use, but can&apos;t undo
                any research already conducted using that data.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
