"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addUpload, type CollectedEntry } from "@/lib/upload-store";
import { useAuth } from "@/lib/auth-context";
import { isMinor, MINIMUM_AGE_DISCLAIMER } from "@/lib/age";
import { validateAttachment } from "@/lib/file-validation";
import { MedicationAutocomplete } from "@/components/MedicationAutocomplete";
import { Turnstile } from "@/components/Turnstile";
import styles from "./upload.module.css";

const checkIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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
    <div className={styles.medicationEntry} role="group" aria-labelledby={`med-heading-${id}`}>
      <div className={styles.medicationEntryHead}>
        <span className={styles.medicationBadge} id={`med-heading-${id}`}>
          Medication {index + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            className={styles.removeMedBtn}
            onClick={onRemove}
            aria-label={`Remove medication ${index + 1}`}
          >
            Remove
          </button>
        )}
      </div>
      <div className={styles.fieldRow3}>
        <MedicationAutocomplete
          id={`med-name-${id}`}
          name={`med-name-${id}`}
          label="Medication name"
          hint=""
          required
        />
        <div className={styles.field}>
          <label htmlFor={`med-dose-${id}`}>Starting dose (mg)</label>
          <div className={styles.doseInputWrap}>
            <input type="number" id={`med-dose-${id}`} name={`med-dose-${id}`} placeholder="e.g. 100" required />
            <span className={styles.doseUnit} aria-hidden="true">mg</span>
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor={`med-dose-current-${id}`}>Current dose (mg)</label>
          <div className={styles.doseInputWrap}>
            <input type="number" id={`med-dose-current-${id}`} name={`med-dose-current-${id}`} placeholder="e.g. 75" required />
            <span className={styles.doseUnit} aria-hidden="true">mg</span>
          </div>
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor={`med-taper-start-${id}`}>Taper start date</label>
          <input type="date" id={`med-taper-start-${id}`} name={`med-taper-start-${id}`} />
        </div>
        <div className={styles.field}>
          <label htmlFor={`med-taper-method-${id}`}>
            Taper method <span className={styles.hint}>(current or most recent)</span>
          </label>
          <select id={`med-taper-method-${id}`} name={`med-taper-method-${id}`} defaultValue="">
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
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const idBase = useId();
  const fileInputId = `${idBase}-file`;
  const fileHintId = `${idBase}-file-hint`;
  const notesId = `${idBase}-notes`;
  const dobId = `${idBase}-dob`;
  const dobErrorId = `${idBase}-dob-error`;
  const consentId = `${idBase}-consent`;
  const medicationCounter = useRef(0);
  const [medicationIds, setMedicationIds] = useState<string[]>(() => [`${idBase}-0`]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dob, setDob] = useState("");
  const underage = !isSignedIn && isMinor(dob);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [attachment, setAttachment] = useState<{ file: File; extension: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [validatingFile, setValidatingFile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

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
        const taperStartDate = ((data.get(`med-taper-start-${id}`) as string) || "").trim();
        const taperMethod = ((data.get(`med-taper-method-${id}`) as string) || "").trim();
        return name ? { name, startingDose, currentDose, taperStartDate, taperMethod } : null;
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
              if (!turnstileToken) {
                setSubmitError("Please complete the verification check below.");
                return;
              }
              setSubmitError(null);
              setSubmitting(true);
              try {
                await addUpload(collectEntry(), attachment, turnstileToken);
                router.push("/profile");
              } catch (err) {
                setSubmitError(err instanceof Error ? err.message : "Couldn't submit your entry. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <p id={`${idBase}-meds-label`} style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "var(--navy)", marginBottom: "6px" }}>
              Psychiatric medication(s) you&apos;re currently tapering
            </p>
            <p className={styles.sectionNote}>
              Please list the name of only one psychiatric medication per entry. If you&apos;re
              tapering more than one at the same time, use &ldquo;+ Add another medication&rdquo;
              below for each additional one.
            </p>

            <div role="group" aria-labelledby={`${idBase}-meds-label`}>
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
              <label htmlFor={notesId}>
                Symptoms / notes <span className={styles.hint}>(optional)</span>
              </label>
              <textarea id={notesId} name="notes" placeholder="Anything you noticed during this period..." />
            </div>

            <div className={styles.field}>
              <p className={styles.fieldLabel} id={`${fileInputId}-label`}>
                Attach a file <span className={styles.hint}>(optional)</span>
              </p>
              <label
                htmlFor={fileInputId}
                className={styles.dropzone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelected(e.dataTransfer.files[0] ?? null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <path d="M12 15V4M12 4L7 9M12 4l5 5" stroke="#112845" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="#112845" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <strong>{attachment ? attachment.file.name : "Drop a file here or click to browse"}</strong>
                <span id={fileHintId}>{validatingFile ? "Checking file…" : "CSV, XLSX, PDF, PNG, or JPG, up to 3MB"}</span>
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept=".csv,.xlsx,.pdf,.png,.jpg,.jpeg"
                  className="sr-only"
                  aria-labelledby={`${fileInputId}-label`}
                  aria-describedby={fileHintId}
                  onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="sr-only" role="status">
                {attachment && !fileError ? `Selected file: ${attachment.file.name}` : ""}
              </p>
              {fileError && (
                <p className={styles.errorText} role="alert">
                  {fileError}
                </p>
              )}
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

            {!isSignedIn && (
              <div className={styles.field}>
                <label htmlFor={dobId}>
                  Date of birth <span className={styles.hint}>(confirms you&apos;re 18 or older, not linked to your entry)</span>
                </label>
                <input
                  id={dobId}
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={underage ? styles.inputError : ""}
                  autoComplete="bday"
                  aria-invalid={underage}
                  aria-describedby={underage ? dobErrorId : undefined}
                  required
                />
                {underage && (
                  <p className={styles.errorText} id={dobErrorId} role="alert">
                    {MINIMUM_AGE_DISCLAIMER}
                  </p>
                )}
              </div>
            )}

            <label className={styles.consentBox} htmlFor={consentId}>
              <input id={consentId} type="checkbox" required />
              <span>
                I understand my data will be anonymized and used in aggregate for research
                purposes, per the{" "}
                <Link href="/privacy" className="link-underline">
                  Privacy Policy
                </Link>
                . I can request deletion at any time.
              </span>
            </label>

            <div className="mt-24">
              <Turnstile onVerify={setTurnstileToken} />
            </div>

            <div className={`${styles.submitRow} mt-24`}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={underage || submitting || validatingFile || !turnstileToken}
              >
                {submitting ? "Submitting…" : "Submit data"}
              </button>
            </div>
            {submitError && (
              <div role="alert" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px", color: "#b3261e", fontSize: "14px", fontWeight: 600 }}>
                {submitError}
              </div>
            )}
          </form>

          <section aria-labelledby={`${idBase}-side-heading`}>
            <div className={`card ${styles.sideCard}`}>
              <h2 className="heading-sm" id={`${idBase}-side-heading`}>What happens to this?</h2>
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
          </section>
        </div>
      </section>
    </main>
  );
}
