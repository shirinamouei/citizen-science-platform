"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { addUpload, type CollectedEntry } from "@/lib/upload-store";
import { isMinor, MINIMUM_AGE_DISCLAIMER } from "@/lib/age";
import { validateAttachment } from "@/lib/file-validation";
import { MedicationAutocomplete } from "@/components/MedicationAutocomplete";
import styles from "./upload.module.css";

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
        <MedicationAutocomplete
          id={`med-name-${id}`}
          name={`med-name-${id}`}
          label="Medication name"
          hint="(one medication only)"
          required
        />
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dob, setDob] = useState("");
  const underage = isMinor(dob);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [attachment, setAttachment] = useState<{ file: File; extension: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [validatingFile, setValidatingFile] = useState(false);

  async function handleFileSelected(selected: File | null) {
    setFileError(null);
    if (!selected) {
      setAttachment(null);
      return;
    }
    setValidatingFile(true);
    const result = await validateAttachment(selected);
    setValidatingFile(false);
    if (!result.ok) {
      setAttachment(null);
      setFileError(result.error);
      return;
    }
    setAttachment({ file: selected, extension: result.extension });
  }

  function addMedication() {
    medicationCounter.current += 1;
    setMedicationIds((prev) => [...prev, `${idBase}-${medicationCounter.current}`]);
  }

  function removeMedication(id: string) {
    setMedicationIds((prev) => prev.filter((m) => m !== id));
  }

  function collectEntry(): CollectedEntry {
    const data = new FormData(formRef.current ?? undefined);
    const medications = medicationIds
      .map((id) => {
        const name = ((data.get(`med-name-${id}`) as string) || "").trim();
        const startingDose = ((data.get(`med-dose-${id}`) as string) || "").trim();
        const currentDose = ((data.get(`med-dose-current-${id}`) as string) || "").trim();
        return name ? { name, startingDose, currentDose } : null;
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
    const notes = ((data.get("notes") as string) || "").trim();
    return { medications, notes };
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
            onSubmit={async (e) => {
              e.preventDefault();
              if (underage) return;
              setSubmitError(null);
              setSubmitting(true);
              try {
                await addUpload(collectEntry(), attachment);
                setSubmitted(true);
              } catch (err) {
                setSubmitError(err instanceof Error ? err.message : "Couldn't submit your entry. Please try again.");
              } finally {
                setSubmitting(false);
              }
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
                Attach a file <span className={styles.hint}>(optional)</span>
              </label>
              <div
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelected(e.dataTransfer.files[0] ?? null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V4M12 4L7 9M12 4l5 5" stroke="#112845" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="#112845" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <strong>{attachment ? attachment.file.name : "Drop a file here or click to browse"}</strong>
                <span>{validatingFile ? "Checking file…" : "CSV, XLSX, PDF, PNG, or JPG, up to 3MB"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.pdf,.png,.jpg,.jpeg"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                />
              </div>
              {fileError && <p className={styles.errorText}>{fileError}</p>}
              {attachment && !fileError && (
                <button
                  type="button"
                  className={styles.removeMedBtn}
                  style={{ marginTop: "8px" }}
                  onClick={() => {
                    setAttachment(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Remove file
                </button>
              )}
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
              <button type="submit" className="btn btn-primary" disabled={underage || submitting || validatingFile}>
                {submitting ? "Submitting…" : "Submit data"}
              </button>
            </div>
            {submitError && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px", color: "#b3261e", fontSize: "14px", fontWeight: 600 }}>
                {submitError}
              </div>
            )}
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
