"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { isMinor, MINIMUM_AGE_DISCLAIMER } from "@/lib/age";
import { MEDICATIONS } from "@/lib/medications";
import styles from "./signin.module.css";

const TOTAL_STEPS = 6;
const MIN_PASSWORD_LENGTH = 6;

// Rejects leading/trailing/consecutive dots in the domain and requires an
// alphabetic TLD of at least 2 characters — catches more junk than a bare
// "has an @ and a dot" check, though it still can't confirm the mailbox exists.
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "throwawaymail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "fakeinbox.com",
  "sharklasers.com",
]);

const COMMON_EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outlool.com": "outlook.com",
};

function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).toLowerCase();
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.progressLabel}>
        Step {step + 1} of {total}
      </div>
    </div>
  );
}

function SegmentedYesNo() {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <div className={styles.segmented}>
      <button
        type="button"
        className={`${styles.segBtn} ${value === "yes" ? styles.segBtnActive : ""}`}
        onClick={() => setValue("yes")}
      >
        Yes
      </button>
      <button
        type="button"
        className={`${styles.segBtn} ${value === "no" ? styles.segBtnActive : ""}`}
        onClick={() => setValue("no")}
      >
        No
      </button>
    </div>
  );
}

function SelectField({
  label,
  hint,
  options,
}: {
  label: string;
  hint?: string;
  options: string[];
}) {
  return (
    <div className={styles.field}>
      <label>
        {label} {hint && <span className={styles.hint}>{hint}</span>}
      </label>
      <select defaultValue="">
        <option value="" disabled>
          Select one
        </option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function MultiSelectQuestion({
  label,
  hint = "Select all that apply",
  options,
}: {
  label: string;
  hint?: string;
  options: string[];
}) {
  return (
    <div className={styles.surveyQ}>
      <label className={styles.surveyLabel}>{label}</label>
      {hint && <span className={styles.surveyHint}>{hint}</span>}
      <div className={styles.checkboxGroup}>
        {options.map((option) => (
          <label key={option} className={styles.checkboxItem}>
            <input type="checkbox" />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

const PRESCRIBED_CONDITION_GROUPS: { category: string; options: string[] }[] = [
  {
    category: "Mental Health Conditions",
    options: [
      "Depression",
      "Anxiety",
      "Bipolar disorder",
      "Obsessive-compulsive disorder (OCD)",
      "Post-traumatic stress disorder (PTSD)",
      "Schizophrenia or other psychotic disorder",
      "Attention-deficit/hyperactivity disorder (ADHD)",
    ],
  },
  {
    category: "Sleep and Neurological Conditions",
    options: [
      "Insomnia or other sleep disorder",
      "Migraine or other neurological condition",
      "Seizure disorder (e.g., epilepsy)",
    ],
  },
  {
    category: "Chronic Physical Health Conditions",
    options: [
      "Chronic pain or fibromyalgia",
      "Gastrointestinal disorder (e.g., Irritable Bowel Syndrome)",
      "Menopausal or premenstrual symptoms (e.g., PMDD, PMS)",
    ],
  },
];

const NOT_LISTED_CATEGORY = "Not listed above";

function PrescribedConditionQuestion() {
  const [category, setCategory] = useState("");
  const group = PRESCRIBED_CONDITION_GROUPS.find((g) => g.category === category);

  return (
    <div className={styles.surveyQ}>
      <label className={styles.surveyLabel}>
        What condition(s) were you originally prescribed this medication for?
      </label>
      <span className={styles.surveyHint}>Select all that apply</span>

      <div className={styles.conditionGroups}>
        <div className={styles.field}>
          <label>Condition category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="" disabled>
              Select one
            </option>
            {PRESCRIBED_CONDITION_GROUPS.map((g) => (
              <option key={g.category} value={g.category}>
                {g.category}
              </option>
            ))}
            <option value={NOT_LISTED_CATEGORY}>{NOT_LISTED_CATEGORY}</option>
          </select>
        </div>

        {group && (
          <div className={styles.checkboxGroup}>
            {group.options.map((option) => (
              <label key={option} className={styles.checkboxItem}>
                <input type="checkbox" />
                {option}
              </label>
            ))}
          </div>
        )}

        {category === NOT_LISTED_CATEGORY && (
          <input type="text" className={styles.otherInput} placeholder="Please specify" />
        )}
      </div>
    </div>
  );
}

function MedicationAutocomplete() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const query = value.trim().toLowerCase();
  const matches =
    query === ""
      ? []
      : MEDICATIONS.filter((m) => m.toLowerCase().includes(query)).slice(0, 6);

  function choose(option: string) {
    setValue(option);
    setOpen(false);
  }

  return (
    <div className={styles.field} style={{ position: "relative" }}>
      <label>
        Medication <span className={styles.hint}>Start typing to see matches</span>
      </label>
      <input
        type="text"
        name="medication"
        autoComplete="off"
        placeholder="e.g., Sertraline (Zoloft)"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            choose(matches[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className={styles.autocompleteList}>
          {matches.map((option, i) => (
            <li
              key={option}
              className={`${styles.autocompleteItem} ${
                i === highlight ? styles.autocompleteItemActive : ""
              }`}
              onMouseDown={() => choose(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [tab, setTab] = useState<"signin" | "create">("signin");

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState("");
  const underage = isMinor(dob);

  const [touched, setTouched] = useState({
    email: false,
    preferredName: false,
    password: false,
    dob: false,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const hasMountedStep = useRef(false);

  useEffect(() => {
    if (!hasMountedStep.current) {
      hasMountedStep.current = true;
      return;
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const trimmedEmail = email.trim();
  const emailFormatValid = EMAIL_REGEX.test(trimmedEmail);
  const emailDomain = getEmailDomain(trimmedEmail.toLowerCase());
  const emailDisposable = emailFormatValid && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain);
  const emailValid = emailFormatValid && !emailDisposable;
  const emailTypoSuggestion = emailValid ? COMMON_EMAIL_DOMAIN_TYPOS[emailDomain] : undefined;

  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const canProceedStep0 = emailValid && preferredName.trim() !== "" && passwordValid;
  const canProceedStep1 = dob !== "";

  const emailInvalid = touched.email && !emailValid;
  const nameInvalid = touched.preferredName && preferredName.trim() === "";
  const passwordInvalid = touched.password && !passwordValid;
  const dobInvalid = touched.dob && dob === "";

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function attemptNext() {
    if (step === 0 && !canProceedStep0) {
      setTouched((t) => ({ ...t, email: true, preferredName: true, password: true }));
      return;
    }
    if (step === 1 && !canProceedStep1) {
      setTouched((t) => ({ ...t, dob: true }));
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    signIn(String(email));
    router.push("/profile");
  }

  function handleCreateAccountSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (underage) return;
    signIn(email);
    router.push("/profile");
  }

  function handleFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && step < TOTAL_STEPS - 1) {
      e.preventDefault();
      attemptNext();
    }
  }

  return (
    <main>
      <section className={styles.authSection}>
        <div className={`wrap ${styles.authCardOuter}`}>
          <div className={styles.authIntro}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              Your account
            </div>
            <h1 style={{ fontSize: "clamp(24px, 7vw, 32px)" }}>Sign in, or create an account</h1>
            <p className="lede" style={{ margin: "12px auto 0", textAlign: "center" }}>
              An account lets you bring tapering data from different sources, like
              spreadsheets, PDFs, and past notes, into one place, and keep track of
              what you&apos;ve donated over time.
            </p>
          </div>

          <div className={styles.authTabs}>
            <button
              type="button"
              className={tab === "signin" ? styles.active : ""}
              onClick={() => setTab("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={tab === "create" ? styles.active : ""}
              onClick={() => setTab("create")}
            >
              Create Account
            </button>
          </div>

          {tab === "signin" ? (
            <div className={`card ${styles.authCard}`}>
              <h2>Welcome back</h2>
              <p className={styles.authSub}>Sign in to pick up right where you left off.</p>

              <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" name="email" placeholder="you@example.com" required />
                </div>
                <div className={styles.field}>
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
                <a href="#" className={styles.forgotLink}>
                  Forgot password?
                </a>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Sign In
                </button>
              </form>

              <div className={styles.authFooterLink}>
                New to Cascade?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("create");
                  }}
                >
                  Create an account
                </a>
              </div>
              <div className={styles.guestInline}>
                <Link href="/upload" className="btn btn-secondary btn-sm">
                  Continue as Guest instead
                </Link>
              </div>
            </div>
          ) : (
            <div className={`card ${styles.authCard}`} ref={cardRef}>
              <h2>Create your account</h2>
              <p className={styles.authSub}>
                A few basics, then some background and tapering-related questions.
              </p>

              <div className={styles.infoNote}>
                <strong>Why we ask:</strong>{" "}
                these optional questions help researchers understand who&apos;s contributing.
                Your answers are anonymized. See our{" "}
                <Link href="/privacy" className="link-underline">
                  Privacy Policy
                </Link>{" "}
                for details.
              </div>

              <ProgressBar step={step} total={TOTAL_STEPS} />

              <form onSubmit={handleCreateAccountSubmit} onKeyDown={handleFormKeyDown}>
                <div style={{ display: step === 0 ? "block" : "none" }}>
                  <div className={styles.stepHeading}>
                    <h3>Create your account</h3>
                    <p>Email, preferred name, and password are required.</p>
                  </div>

                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      className={emailInvalid ? styles.inputError : ""}
                    />
                    {emailInvalid && (
                      <p className={styles.errorText}>
                        {trimmedEmail === ""
                          ? "Email is required."
                          : emailDisposable
                            ? "Please use a permanent email address, not a disposable one."
                            : "Enter a valid email address."}
                      </p>
                    )}
                    {!emailInvalid && emailTypoSuggestion && (
                      <p className={styles.fieldHint}>
                        Did you mean{" "}
                        <button
                          type="button"
                          className={styles.inlineTextButton}
                          onClick={() =>
                            setEmail(`${trimmedEmail.slice(0, trimmedEmail.lastIndexOf("@"))}@${emailTypoSuggestion}`)
                          }
                        >
                          {trimmedEmail.slice(0, trimmedEmail.lastIndexOf("@"))}@{emailTypoSuggestion}
                        </button>
                        ?
                      </p>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label>Preferred name</label>
                    <input
                      type="text"
                      placeholder="What should we call you?"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, preferredName: true }))}
                      className={nameInvalid ? styles.inputError : ""}
                    />
                    {nameInvalid && <p className={styles.errorText}>Preferred name is required.</p>}
                  </div>
                  <div className={styles.field}>
                    <label>Password</label>
                    <div className={styles.passwordWrap}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        className={passwordInvalid ? styles.inputError : ""}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {passwordInvalid && (
                      <p className={styles.errorText}>
                        {password === ""
                          ? "Password is required."
                          : `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`}
                      </p>
                    )}
                    <p className={styles.fieldHint}>Must be at least {MIN_PASSWORD_LENGTH} characters.</p>
                  </div>
                </div>

                <div style={{ display: step === 1 ? "block" : "none" }}>
                  <div className={styles.stepHeading}>
                    <h3>Basic health background</h3>
                    <p>All fields are optional except date of birth.</p>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label>Date of birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={dobInvalid || underage ? styles.inputError : ""}
                      />
                      {dobInvalid && <p className={styles.errorText}>Date of birth is required.</p>}
                      {!dobInvalid && underage && (
                        <p className={styles.errorText}>{MINIMUM_AGE_DISCLAIMER}</p>
                      )}
                    </div>
                    <SelectField
                      label="Gender"
                      options={["Female", "Male", "Non-binary", "Prefer to self-describe", "Prefer not to say"]}
                    />
                  </div>
                  <div className={styles.fieldRow}>
                    <SelectField
                      label="Race"
                      options={[
                        "American Indian or Alaska Native",
                        "Asian",
                        "Black or African American",
                        "Native Hawaiian or Other Pacific Islander",
                        "White",
                        "Two or more races",
                        "Prefer not to say",
                      ]}
                    />
                    <SelectField
                      label="Highest level of education"
                      options={[
                        "Less than high school",
                        "High school diploma or GED",
                        "Some college",
                        "Associate degree",
                        "Bachelor's degree",
                        "Graduate or professional degree",
                        "Prefer not to say",
                      ]}
                    />
                  </div>
                  <div className={styles.fieldRow}>
                    <SelectField
                      label="Current employment status"
                      options={[
                        "Employed full-time",
                        "Employed part-time",
                        "Self-employed",
                        "Unemployed",
                        "Student",
                        "Retired",
                        "Unable to work",
                        "Prefer not to say",
                      ]}
                    />
                    <SelectField
                      label="Annual household income"
                      options={[
                        "Under $25,000",
                        "$25,000–$49,999",
                        "$50,000–$74,999",
                        "$75,000–$99,999",
                        "$100,000–$149,999",
                        "$150,000 or more",
                        "Prefer not to say",
                      ]}
                    />
                  </div>
                </div>

                <div style={{ display: step === 2 ? "block" : "none" }}>
                  <div className={styles.stepHeading}>
                    <h3>About your medication</h3>
                    <p>All fields in this section are optional.</p>
                  </div>

                  <MedicationAutocomplete />

                  <PrescribedConditionQuestion />

                  <SelectField
                    label="How long have you been taking the medication you're currently reducing or stopping?"
                    options={[
                      "Less than 6 months",
                      "6 months to 1 year",
                      "1-2 years",
                      "3-5 years",
                      "6-10 years",
                      "More than 10 years",
                      "Not sure",
                    ]}
                  />

                  <SelectField
                    label="Have you tried reducing or stopping this medication before?"
                    options={[
                      "No, this is my first time",
                      "Yes, I've made 1–2 previous attempts",
                      "Yes, I've made 3–4 previous attempts",
                      "Yes, I've made 5 or more previous attempts",
                      "Yes, I've made multiple attempts but don't remember how many",
                      "Not sure",
                    ]}
                  />

                  <SelectField
                    label="How long have you been reducing or stopping this medication?"
                    options={["Less than 1 month", "1–2 months", "3–6 months", "7–11 months", "1–2 years", "More than 2 years"]}
                  />

                  <div className={styles.surveyQ}>
                    <label className={styles.surveyLabel}>
                      Are you currently working with a healthcare provider to taper your
                      psychiatric medication?
                    </label>
                    <SegmentedYesNo />
                  </div>
                </div>

                <div style={{ display: step === 3 ? "block" : "none" }}>
                  <div className={styles.stepHeading}>
                    <h3>Tracking your withdrawal symptoms</h3>
                    <p>Part 1 of 3 · Optional. Helps us understand how you track your taper.</p>
                  </div>

                  <MultiSelectQuestion
                    label="What prompted you to track your withdrawal symptoms?"
                    options={[
                      "Curiosity about my own patterns",
                      "A recommendation from a healthcare provider",
                      "Wanting to share information with my doctor",
                      "Difficulty remembering symptoms day-to-day",
                      "Preparing for a taper or dose change",
                      "Something else",
                    ]}
                  />

                  <SelectField
                    label="How often do you track withdrawal symptoms?"
                    options={["Daily", "A few times a week", "Weekly", "Occasionally", "Only when symptoms are severe", "I don't track regularly"]}
                  />

                  <MultiSelectQuestion
                    label="What do you track when recording withdrawal symptoms?"
                    options={[
                      "Physical symptoms",
                      "Emotional or mood changes",
                      "Sleep patterns",
                      "Energy levels",
                      "Appetite changes",
                      "Cognitive changes (focus, memory)",
                      "Other",
                    ]}
                  />
                </div>

                <div style={{ display: step === 4 ? "block" : "none" }}>
                  <div className={styles.stepHeading}>
                    <h3>Tracking your withdrawal symptoms</h3>
                    <p>Part 2 of 3 · Optional. Helps us understand how you track your taper.</p>
                  </div>

                  <MultiSelectQuestion
                    label="When you record withdrawal symptoms, what kind of information do you typically include?"
                    options={[
                      "Severity or intensity",
                      "Time of day",
                      "Duration",
                      "Possible triggers",
                      "Medication dose at the time",
                      "Free-text notes",
                      "Other",
                    ]}
                  />

                  <MultiSelectQuestion
                    label="What tools or methods do you use to keep track of your withdrawal symptoms?"
                    options={[
                      "Written notes / journal",
                      "Spreadsheet or app",
                      "Calendar",
                      "Digital tools (step counter, sleep tracker, etc.)",
                      "Voice memos",
                      "Other",
                    ]}
                  />

                  <MultiSelectQuestion
                    label="What other aspects of your life and experiences, if any, do you record while keeping track of withdrawal symptoms?"
                    options={[
                      "Sleep quality",
                      "Diet or nutrition",
                      "Exercise or physical activity",
                      "Stress levels",
                      "Social interactions",
                      "Work or school performance",
                      "Other",
                    ]}
                  />
                </div>

                <div style={{ display: step === 5 ? "block" : "none" }}>
                  <div className={styles.stepHeading}>
                    <h3>Tracking your withdrawal symptoms</h3>
                    <p>Part 3 of 3 · Optional. Helps us understand how you track your taper.</p>
                  </div>

                  <MultiSelectQuestion
                    label="What challenges, if any, have you faced when trying to track your symptoms?"
                    options={[
                      "Forgetting to log entries",
                      "Not knowing what to track",
                      "Symptoms feeling hard to put into words",
                      "Not having enough time",
                      "Inconsistent tools or formats",
                      "No real challenges so far",
                      "Other",
                    ]}
                  />

                  <MultiSelectQuestion
                    label="How do you use the information you record or keep track of?"
                    hint="e.g., symptoms, dosage, sleep. Select all that apply"
                    options={[
                      "To share with my healthcare provider",
                      "To notice patterns over time",
                      "To help decide taper pace or timing",
                      "For my own personal reflection",
                      "To contribute to research like this platform",
                      "Other",
                    ]}
                  />

                  <div className={styles.consentBox}>
                    <input type="checkbox" required />
                    <span>
                      I understand my responses will be anonymized and used in aggregate for
                      research purposes, per the{" "}
                      <Link href="/privacy" className="link-underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </div>
                </div>

                <div className={styles.wizardNav}>
                  {step > 0 && (
                    <button type="button" className="btn btn-secondary" onClick={goBack}>
                      Back
                    </button>
                  )}
                  {step < TOTAL_STEPS - 1 ? (
                    <button
                      type="button"
                      className={`btn btn-primary ${styles.wizardNavNext}`}
                      onClick={attemptNext}
                      aria-disabled={
                        (step === 0 && !canProceedStep0) || (step === 1 && !canProceedStep1)
                      }
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={`btn btn-primary ${styles.wizardNavNext}`}
                      disabled={underage}
                    >
                      Create Account
                    </button>
                  )}
                </div>
              </form>

              <div className={styles.authFooterLink}>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab("signin");
                  }}
                >
                  Sign in
                </a>
              </div>
              <div className={styles.guestInline}>
                <Link href="/upload" className="btn btn-secondary btn-sm">
                  Continue as Guest instead
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
