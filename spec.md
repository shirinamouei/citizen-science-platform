# Data Collection Website
Alysa Kulchenko, Avi Rajesh  

## Introduction

### Overview  
Self tracking is commonly used during the tapering process to keep track of symptoms and progress, however those with existing data may have no way of efficiently organizing, processing, and/or analyzing it. Data may be stored in a variety of forms, such as physical diary entries, pdfs, digital notes, AI assistant conversations, and more.  

Our solution introduces a website where patients who are tapering can voluntarily upload their data in whichever form they have it. This encourages users to store their data in one place, allowing for simplified progress tracking, and creating a personalized tapering journey. We emphasize accessibility by ensuring that various data types are accurately processed using LLMs, and uploaded for users to track their progress. 

### Background  
Tapering is inherently a solitary process, putting emotional pressure on those who may already be suffering from physical symptoms associated with it. Giving tapering patients a place where they can record, organize, and analyse their data, supports them throughout the process, allowing them to experience a safer medication discontinuation.  

### Existing Digital Solutions
Mobile Calendar:  
* Digital calendars can be used to schedule dosage reductions and log symptoms.  

Support Forums:  
* Inner Compase Initiative (https://www.theinnercompass.org/) provides those tapering with information about how to prepare, safely taper, and survive withdrawal.
* Surviving Antidepressants (https://www.survivingantidepressants.org/) is a patient-led website providing peer support to those tapering, containing FAQs, and spaces for those tapering to discuss their experiences.
* CureTogether was a platform that allowed patients to anonymously track their symptoms, treatments, medications, and side effects, simultanously collecting data about hundreds of medical conditions. It was acquired by 23andMe in 2012.  

Apps:  
* Bearable (https://bearable.app/) health tracking app in which users can track symptoms, doses, and withdrawal side effects. Generates charts over time.
* CareClinic (https://careclinic.io/features/) provides medication reminders, symptom tracking, and health journals.

Although digital products exist to help those tapering with tracking symptoms, withdrawal, and progress, there are no currently available platforms that allow patients to upload existing tapering data in whichever form they have it, and build their progress from there. Currently existing products may work for those at the beginning of the tapering process, but don't offer an opportunity for those containing data in different forms (physical and/or digital) to sufficiently organize it. 

### Security Considerations

The site is a static export hosted on GitHub Pages with no application server. Reads and deletes go directly from the browser to Supabase using the public `anon` key, so Postgres Row Level Security (RLS) is the access-control layer for them. **Creating data is the exception:** every new entry, and its attachment, goes through the `submit-entry` Edge Function ([supabase/functions/submit-entry/index.ts](supabase/functions/submit-entry/index.ts)), which is the only server-side code in the system. It verifies a Cloudflare Turnstile CAPTCHA token, enforces a per-network rate limit, validates any attached file, and then writes using the service role. The policies below are written against the data this app collects (see [signin/page.tsx](src/app/signin/page.tsx) and [upload/page.tsx](src/app/upload/page.tsx)).

#### Authentication
- Real Supabase Auth (email/password) replaces the current localStorage mock in [auth-context.tsx](src/lib/auth-context.tsx), so `auth.uid()` in policies below refers to a verified session, not an unverified string.
- "Continue as Guest" stays unauthenticated (`anon` role) — guests can submit data but never read anything back, matching the current in-memory-only behavior in [upload-store.ts](src/lib/upload-store.ts).
- Sign-in and account creation are protected by Turnstile through Supabase Auth's CAPTCHA setting (the token is passed as `captchaToken`).

#### Database access control (Row Level Security)

**`profiles`** — the optional demographic survey collected at signup (gender, race, education, employment, income). One row per account; never joined to `entries` in any client-facing query.

```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_name text,
  gender text,
  race text,
  education text,
  employment_status text,
  household_income text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = user_id);
create policy "profiles_delete_own" on profiles for delete using (auth.uid() = user_id);
-- No policy permits reading another user's profile — RLS default-denies everything not explicitly allowed.
```

**`entries`** — tapering submissions from [upload/page.tsx](src/app/upload/page.tsx). Supports both signed-in and guest submissions.

```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  medications jsonb not null default '[]'::jsonb,
  notes text,
  status text not null default 'synced' check (status in ('synced', 'pending')),
  age_verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table entries enable row level security;

create policy "entries_select_own" on entries for select using (auth.uid() = user_id);
create policy "entries_update_own" on entries for update using (auth.uid() = user_id);
create policy "entries_delete_own" on entries for delete using (auth.uid() = user_id);

-- Deliberately NO insert policy for anon or authenticated. Rows are created
-- only by the submit-entry Edge Function (service role, which bypasses RLS),
-- so the CAPTCHA and rate limit cannot be skipped by calling the REST API
-- directly. Also no select/update/delete policy for the anon role: guest
-- submissions are write-only, so a guest can never read back anyone's
-- data, including their own, after the page reloads.
revoke insert, update on public.entries from anon, authenticated;
```

**Creating an entry** is done by the `submit_entry` Postgres function, called only by the Edge Function. Its `EXECUTE` privilege is limited to `postgres` and `service_role`; if it were left at the default (`PUBLIC`), anyone with the public key could call `/rest/v1/rpc/submit_entry` and bypass the CAPTCHA. Verify with:

```sql
select grantee, privilege_type
from information_schema.routine_privileges
where routine_name = 'submit_entry';
-- expect only postgres and service_role
```

Note: the date-of-birth field is only used to gate submission (`age_verified`) and is never written to `entries` — the UI already tells users DOB is "not linked to your entry," so the schema should honor that by never persisting it alongside tapering data.

**`drafts`** — only ever created by signed-in users; guest drafts stay in memory client-side by design, so no guest insert policy is needed here.

```sql
create table drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medications jsonb not null default '[]'::jsonb,
  notes text,
  updated_at timestamptz not null default now()
);

alter table drafts enable row level security;

create policy "drafts_all_own" on drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

#### File attachments (Supabase Storage)
The upload form accepts a pharmacy printout, spreadsheet, PDF or image (CSV, XLSX, PDF, PNG, JPG) up to 3MB. The browser never writes to storage directly: the file is sent to the `submit-entry` Edge Function in the same request as the entry. The function verifies the CAPTCHA **first**, then validates the file server-side (size, extension allow-list, magic bytes — the same checks as [file-validation.ts](src/lib/file-validation.ts), which only exist client-side as a convenience), builds the storage path itself as `<user id or "guest">/<entry id>.<ext>` (never trusting a client-supplied path), and uploads with the service role. If the database insert fails afterward, the function removes the file.

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'entry-attachments', 'entry-attachments', false, 3145728,
  array['text/csv','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/pdf','image/png','image/jpeg']
);

-- Deliberately NO insert policy on storage.objects for this bucket. An earlier
-- design let the browser upload directly (a policy allowing `guest/` or the
-- user's own folder), which let a script fill storage without solving the
-- CAPTCHA. That policy ("attachments insert own or guest") has been dropped.

create policy "attachments select own" on storage.objects
  for select to authenticated using (bucket_id = 'entry-attachments' and owner = auth.uid());

create policy "attachments delete own" on storage.objects
  for delete to authenticated using (bucket_id = 'entry-attachments' and owner = auth.uid());
```

The bucket must exist before the first attachment submission; if it is missing, uploads fail with a 500 ("Couldn't save your attachment"). The site does not currently display stored attachments; they are viewed in the Supabase dashboard under Storage.

#### Secrets management
- Only the Project URL and `publishable` key are ever used client-side, as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — both are expected to be visible in the shipped JS bundle.
- The `service_role` key is never used client-side or in this repo or its GitHub Actions secrets. It is used only inside the `submit-entry` Edge Function, where Supabase injects it as an environment variable. The function's other secrets (`TURNSTILE_SECRET_KEY`, `IP_HASH_PEPPER`) are stored as Edge Function secrets, not in the repo. Any future feature that needs to bypass RLS (e.g. the aggregate research export below) belongs in an Edge Function the same way.
- Use real Turnstile keys in production — Cloudflare's published test keys (starting `1x0000...`) always pass and would disable the CAPTCHA.
- The keep-alive job ([.github/workflows/keep-alive.yml](.github/workflows/keep-alive.yml)) only uses the `anon` key (see "Keep-alive" below).

#### Repository & CI hygiene
- Confirm `.env.local` stays git-ignored (Next.js does this by default) and check git history for anything already committed before making the repo public.
- Enable GitHub secret scanning + push protection on the repo.
- Store the two Supabase values as GitHub Actions repo secrets (Settings → Secrets and variables → Actions), never as plain workflow variables.

#### Abuse mitigation
Guest submissions have no auth in front of them, so the protections live in the `submit-entry` Edge Function:

- **CAPTCHA** — Cloudflare Turnstile ([Turnstile.tsx](src/components/Turnstile.tsx)) gates the submit button, and the function verifies the token with Cloudflare on every request. Verification happens server-side, so hiding the button or forging a request does not bypass it.
- **Rate limit** — the function hashes the caller's IP with a secret pepper (`IP_HASH_PEPPER`) and the `submit_entry` function rejects too many submissions from the same hash (`rate_limited`, returned as HTTP 429). Raw IPs are not stored.
- **No bypass routes** — no insert policy or grant on `entries`, `EXECUTE` on `submit_entry` limited to the service role, and no client write access to the attachments bucket (see above).
- **Still open:** a `check` constraint capping `notes` length and the size of the `medications` array, so a single payload can't be arbitrarily large.

#### Keep-alive
Free-tier Supabase projects pause after a period of inactivity. A scheduled GitHub Actions workflow ([keep-alive.yml](.github/workflows/keep-alive.yml)) runs every 5 days and queries `medication_catalog` — a table `anon` can read — with `Prefer: count=exact`, so Postgres performs a real count query. It uses only the public URL and publishable key, passed as repo secrets, and fails on any non-2xx response. It does not touch `submit-entry`, so it needs no CAPTCHA token. Pinging the `/rest/v1/` root does not work: it returns 401 for publishable keys. It is not confirmed that this ping prevents pausing; the project paused once after a successful ping. If it recurs, options are a write-based ping, a more frequent schedule, or the Pro plan.

### Privacy Considerations

The medication and demographic data this site collects is sensitive health information, so the schema above is designed to keep the site's existing privacy promises ("identifiers removed before storage," "used only in aggregate," "delete your contributions anytime," see [upload/page.tsx](src/app/upload/page.tsx)) technically enforced rather than just stated in copy.

- **Data minimization** — date of birth is collected only to gate submission and is discarded after producing the `age_verified` boolean; the raw value is never written to `entries` or `drafts`. The same approach should apply to the signup survey: store `is_adult` rather than raw DOB in `profiles` unless exact age is actually needed for research stratification.
- **De-identification for research use** — `entries.user_id` lets a signed-in user view and delete their own history, but it should never be exposed through any client-facing query beyond `auth.uid() = user_id`. When the dataset is pulled for actual research analysis, use a view that drops `user_id` entirely rather than querying `entries` directly, so a row can't be traced back to an account even by someone with legitimate analysis access:
  ```sql
  create view research_export as
    select id, medications, notes, status, created_at from entries;

  revoke all on research_export from anon, authenticated;
  ```
- **Guest submissions** — guests can submit but never read back any row (not even their own), which matches the current mock's memory-only guest behavior and means a guest submission genuinely cannot be tied to a browsing session after the fact.
- **Deletion requests** — the `entries_delete_own` policy makes the "delete anytime" promise real for a signed-in user's own rows. The existing footnote already sets the right expectation that deletion can't retroactively undo research already completed with that data.
- **Free-text risk** — the `notes` field is unstructured, so a user could accidentally paste identifying information into it. This isn't something RLS can catch; consider adding a caution near the field in the UI, since it's a content problem rather than an access-control one.


