"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { addUpload, saveDraft } from "@/lib/upload-store";
import { isMinor, MINIMUM_AGE_DISCLAIMER } from "@/lib/age";
import styles from "./upload.module.css";

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

const MEDICATION_OPTIONS = [
  "Sertraline (Zoloft)",
  "Fluoxetine (Prozac)",
  "Escitalopram (Lexapro)",
  "Paroxetine (Paxil)",
  "Citalopram (Celexa)",
  "Venlafaxine (Effexor)",
  "Duloxetine (Cymbalta)",
  "Alprazolam (Xanax)",
  "Clonazepam (Klonopin)",
  "Diazepam (Valium)",
  "Lorazepam (Ativan)",
  "Other",
];

function MedicationEntryFields({
  id,
  index,
  showRemove,
  onRemove,
}: {
  id: string;
  index: number;
  showRemove: boolean;
  onRemove: () => void;
}) {
  const [medication, setMedication] = useState("");

  return (
    <div className={styles.medicationEntry}>
      <div className={styles.medicationEntryHead}>
        <span className={styles.medicationBadge}>Medication {index + 1}</span>
        {showRemove && (
          <button type="button" className={styles.removeMedBtn} onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      <div className={styles.fieldRow3}>
        <div className={styles.field}>
          <label>
            Medication name <span className={styles.hint}>(one medication only)</span>
          </label>
          <select
            name={`med-name-${id}`}
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            required
          >
            <option value="" disabled>
              Select one
            </option>
            {MEDICATION_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          {medication === "Other" && (
            <input
              type="text"
              name={`med-name-other-${id}`}
              placeholder="Type the medication name"
              className={styles.otherInput}
              required
            />
          )}
        </div>
        <div className={styles.field}>
          <label>
            Starting dose <span className={styles.hint}>(mg, best estimate is fine)</span>
          </label>
          <input type="number" name={`med-dose-${id}`} placeholder="e.g. 100" required />
        </div>
        <div className={styles.field}>
          <label>
            Current dose <span className={styles.hint}>(mg, as of today)</span>
          </label>
          <input type="number" name={`med-dose-current-${id}`} placeholder="e.g. 75" required />
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
  );
}

export default function UploadPage() {
  const idBase = useId();
  const medicationCounter = useRef(0);
  const [medicationIds, setMedicationIds] = useState<string[]>(() => [`${idBase}-0`]);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [dob, setDob] = useState("");
  const underage = isMinor(dob);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function addMedication() {
    medicationCounter.current += 1;
    setMedicationIds((prev) => [...prev, `${idBase}-${medicationCounter.current}`]);
  }

  function removeMedication(id: string) {
    setMedicationIds((prev) => prev.filter((m) => m !== id));
  }

  function collectEntry() {
    const data = new FormData(formRef.current ?? undefined);
    const meds = medicationIds
      .map((id) => {
        const selected = ((data.get(`med-name-${id}`) as string) || "").trim();
        const custom = ((data.get(`med-name-other-${id}`) as string) || "").trim();
        return selected === "Other" ? custom : selected;
      })
      .filter(Boolean);
    const doseSummaries = medicationIds
      .map((id) => {
        const starting = (data.get(`med-dose-${id}`) as string)?.trim();
        const current = (data.get(`med-dose-current-${id}`) as string)?.trim();
        if (starting && current) return `${starting}mg → ${current}mg`;
        return starting || current ? `${starting || current}mg` : "";
      })
      .filter(Boolean);
    const notes = ((data.get("notes") as string) || "").trim();
    return {
      date: formatToday(),
      med: meds.length ? meds.join(", ") : "Untitled entry",
      dose: doseSummaries.length ? doseSummaries.join(", ") : "—",
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
          <h1 style={{ fontSize: "clamp(26px, 8vw, 38px)" }}>Log your tapering data</h1>
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
              if (underage) return;
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
                <MedicationEntryFields
                  key={id}
                  id={id}
                  index={index}
                  showRemove={medicationIds.length > 1}
                  onRemove={() => removeMedication(id)}
                />
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
                Attach a file <span className={styles.hint}>(pharmacy printout, journal entry, spreadsheet, CSV, etc., optional)</span>
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

            <div className={styles.field}>
              <label>
                Date of birth <span className={styles.hint}>(confirms you&apos;re 18 or older, not linked to your entry)</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={underage ? styles.inputError : ""}
                required
              />
              {underage && <p className={styles.errorText}>{MINIMUM_AGE_DISCLAIMER}</p>}
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
              <button type="submit" className="btn btn-primary" disabled={underage}>
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
