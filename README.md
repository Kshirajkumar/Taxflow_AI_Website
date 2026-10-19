# Taxflow.AI Website

An independent React, TypeScript, and Vite marketing website for Taxflow.AI.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL (normally `http://127.0.0.1:5174`). Available pages are `/`, `/product`, `/workflow-comparison`, `/get-app`, and `/waitlist`. Unknown paths show the branded 404 page.

## Product and workflow pages

- `/workflow-comparison` describes common manual document-work steps alongside TaxFlow's intended workflow. It is qualitative—not a measured time-saving claim—and marks internal testing, human review, and roadmap status.
- `/get-app` explains the product's availability. The install call to action clearly says the app is coming soon and links to the waitlist; it does not imply a download is available.

## Connect the existing Supabase project

The website uses the same Supabase project as the TaxFlow app. It stores waitlist submissions in its own `public.website_waitlist` table and does not access app profiles, clients, or documents.

1. In the existing TaxFlow Supabase project, open **SQL Editor → New query**.
2. Run the complete migration in [`supabase/website_waitlist.sql`](./supabase/website_waitlist.sql). It creates the waitlist table and indexes, validates consent and submitted fields, and exposes a narrowly scoped RPC function. Anonymous website visitors can submit but cannot read or edit waitlist records. The migration is safe to re-run.
3. In **Project Settings → API Keys**, copy that project's **Project URL** and **Publishable key** (or its legacy `anon` key). Do not use the service-role key.
4. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   VITE_SUPABASE_URL=the-existing-project-url
   VITE_SUPABASE_ANON_KEY=the-existing-project-publishable-or-anon-key
   ```

5. Restart the local Vite server. Without these public settings, the form clearly labels submissions as browser-only preview data; it does not claim they were sent.

The `VITE_` prefix is required because this is a browser app. Vite embeds these values in the built JavaScript, so Supabase's URL and publishable/legacy anon key are public by design. If Vercel warns that a `VITE_` value is exposed to the browser, that warning is expected for these two public values: keep the `VITE_` names and do not change them to Vercel-only `Config` variables. Marking a value “Sensitive” can hide it in Vercel's dashboard, but does not make a `VITE_` value secret in the deployed site. Never use a Supabase secret key (`sb_secret_...`) or `SUPABASE_SERVICE_ROLE_KEY` here.

The form calls `public.join_website_waitlist` with the required consent and optional name, firm, role, country, and firm-size fields. Duplicate emails are accepted without disclosing whether an address is already on the list. The RPC stores a submission; it does not send an email. Add a server-side email provider or Supabase Edge Function separately if email notifications are required.

An optional `VITE_WAITLIST_ENDPOINT` can be used instead of Supabase RPC; if set, it takes precedence and must be an HTTPS endpoint that accepts the documented waitlist JSON fields. Never put private credentials in a `VITE_*` variable.

Waitlist entries can be managed from the existing project's Supabase dashboard or SQL Editor by an authorized administrator. Do not grant public `SELECT` access or place the service-role key in frontend code.

## Deploy with Vercel

Import this website repository into Vercel and configure:

- **Framework preset:** Vite
- **Root directory:** `./` (the repository root)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, using the same existing Supabase project values as local development. Add them for each Vercel environment you use.

These are public browser configuration values, not secrets. Vercel may flag their `VITE_` prefix because the values are included in browser JavaScript; keep the prefix so the app can read them. Use only the Supabase Project URL and Publishable key (or legacy anon key), never a secret/service-role key. Redeploy after adding or changing them.

The Vercel configuration rewrites the `/product`, `/waitlist`, `/get-app`, and `/workflow-comparison` application routes to the Vite entry point. Other unknown paths use the branded `public/404.html` page. No Supabase authentication redirect settings are required for the waitlist.

## Build

```bash
npm run build
npm run preview
```

## Accessibility and product accuracy

The theme toggle supports light and dark mode, remembers the selection in this browser, and otherwise follows the operating-system preference. Scroll and ambient animations respect `prefers-reduced-motion`.

The product page distinguishes the PRD's vision and roadmap from the current working demo. Workflow comparisons are qualitative and do not claim measured time savings or accuracy results. No customer logos, security certifications, or product capabilities beyond the PRD are asserted.

**Before launch:** consider abuse/rate-limit protection (such as CAPTCHA) for the public submission function, configure a retention process for submitted personal data, and test the production waitlist with the deployed domain. Never expose `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` setting.
