# Cascade

Cascade is a citizen science platform where people tapering off psychiatric
medication can donate their tapering data — doses, taper method, symptoms —
to support research that helps future patients taper more safely.

- **Continue as a guest** to donate a single anonymous entry, no account needed.
- **Create an account** to bring data scattered across notebooks, PDFs,
  spreadsheets, and chat logs into one place, save drafts, and keep a history
  of past contributions on your profile.

Every contribution is opt-in and identifying details are stripped before the
data reaches a researcher — see [spec.md](spec.md) for the security and
privacy design, including the planned Supabase Row Level Security policies.

## Pages

- `/` — landing page and mission overview
- `/about` — project values and background
- `/signin` — sign in, create an account, or continue as a guest
- `/upload` — log tapering data (medications, doses, notes, optional file)
- `/profile` — signed-in users' draft and upload history
- `/privacy` — privacy policy

## Status

This is currently a front-end prototype: sign-in and upload history are
mocked with `localStorage` (see [src/lib/auth-context.tsx](src/lib/auth-context.tsx)
and [src/lib/upload-store.ts](src/lib/upload-store.ts)), and there is no
database wired up yet. A real backend on Supabase is planned next.

Built with [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.
