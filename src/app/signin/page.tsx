"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { isMinor, MINIMUM_AGE_DISCLAIMER } from "@/lib/age";
import styles from "./signin.module.css";

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

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [tab, setTab] = useState<"signin" | "create">("signin");
  const [dob, setDob] = useState("");
  const underage = isMinor(dob);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    signIn(String(email));
    router.push("/profile");
  }

  function handleCreateAccountSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (underage) return;
    const email = new FormData(e.currentTarget).get("email");
    signIn(String(email));
    router.push("/profile");
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
            <div className={`card ${styles.authCard}`}>
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

              <form onSubmit={handleCreateAccountSubmit}>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" name="email" placeholder="you@example.com" required />
                </div>
                <div className={styles.field}>
                  <label>Preferred name</label>
                  <input type="text" placeholder="What should we call you?" required />
                </div>
                <div className={styles.field}>
                  <label>Password</label>
                  <input type="password" placeholder="Create a password" required />
                </div>

                <div className={styles.sectionDivider}>
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
                      className={underage ? styles.inputError : ""}
                      required
                    />
                    {underage && <p className={styles.errorText}>{MINIMUM_AGE_DISCLAIMER}</p>}
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

                <div className={styles.sectionDivider}>
                  <h3>About your medication</h3>
                  <p>All fields in this section are optional.</p>
                </div>

                <MultiSelectQuestion
                  label="Medication(s)"
                  options={[
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
                  ]}
                />

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

                <div className={styles.sectionDivider}>
                  <h3>Tracking your withdrawal symptoms</h3>
                  <p>Optional. Helps us understand how you track your taper.</p>
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

                <button
                  type="submit"
                  className="btn btn-primary mt-24"
                  style={{ width: "100%" }}
                  disabled={underage}
                >
                  Create Account
                </button>
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
