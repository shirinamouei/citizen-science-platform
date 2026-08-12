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

The site is a static export hosted on GitHub Pages with no application server. Every request to Supabase — signed-in or guest — comes directly from the browser using the public `anon` key. That means Postgres Row Level Security (RLS) is the only access-control layer in the system; there is no server-side code to fall back on. The policies below are a draft to apply once the Supabase project exists, written against the data this app already collects (see [signin/page.tsx](src/app/signin/page.tsx) and [upload/page.tsx](src/app/upload/page.tsx)).

#### Authentication
- Real Supabase Auth (email/password) replaces the current localStorage mock in [auth-context.tsx](src/lib/auth-context.tsx), so `auth.uid()` in policies below refers to a verified session, not an unverified string.
- "Continue as Guest" stays unauthenticated (`anon` role) — guests can submit data but never read anything back, matching the current in-memory-only behavior in [upload-store.ts](src/lib/upload-store.ts).

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

create policy "entries_insert_authenticated" on entries
  for insert to authenticated
  with check (auth.uid() = user_id and age_verified = true);

create policy "entries_insert_guest" on entries
  for insert to anon
  with check (user_id is null and age_verified = true);
-- Deliberately no select/update/delete policy for the anon role: guest
-- submissions are write-only, so a guest can never read back anyone's
-- data, including their own, after the page reloads.
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
The upload form accepts a pharmacy printout, spreadsheet, or PDF up to 10MB. Storage needs its own policies, mirroring `entries`:

```sql
insert into storage.buckets (id, name, public) values ('entry-attachments', 'entry-attachments', false);

create policy "attachments_insert" on storage.objects
  for insert to public
  with check (
    bucket_id = 'entry-attachments'
    and (metadata->>'size')::bigint <= 10485760
    and metadata->>'mimetype' in (
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'
    )
  );

create policy "attachments_select_own" on storage.objects
  for select to authenticated using (bucket_id = 'entry-attachments' and owner = auth.uid());

create policy "attachments_delete_own" on storage.objects
  for delete to authenticated using (bucket_id = 'entry-attachments' and owner = auth.uid());
```

#### Secrets management
- Only the Project URL and `anon` key are ever used client-side, as `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — both are expected to be visible in the shipped JS bundle.
- The `service_role` key is never used by this app. If a future feature genuinely needs to bypass RLS (e.g. building the aggregate research export below), that logic belongs in a Supabase Edge Function, not in this repo or its GitHub Actions secrets, since GitHub Pages has no server to keep it off the client.
- The existing keep-alive cron ([keep-alive/route.ts](src/app/api/cron/keep-alive/route.ts)) only uses the `anon` key already, so it carries over to a GitHub Actions scheduled workflow without any secret-handling change.

#### Repository & CI hygiene
- Confirm `.env.local` stays git-ignored (Next.js does this by default) and check git history for anything already committed before making the repo public.
- Enable GitHub secret scanning + push protection on the repo.
- Store the two Supabase values as GitHub Actions repo secrets (Settings → Secrets and variables → Actions), never as plain workflow variables.

#### Abuse mitigation
Guest inserts have no auth in front of them, so nothing stops a script from submitting many fake entries. Options worth adding before launch: a client-side CAPTCHA widget (e.g. Cloudflare Turnstile) gating the guest submit button, and/or a `check` constraint capping `notes` length and array size on `medications` so a single malicious payload can't be arbitrarily large.

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


