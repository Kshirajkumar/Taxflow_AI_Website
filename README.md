# Taxflow.AI Website

An independent React, TypeScript, and Vite marketing website for Taxflow.AI.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL (normally `http://127.0.0.1:5174`). Available pages are `/`, `/product`, `/workflow-comparison`, `/get-app`, `/waitlist`, `/portal`, `/privacy`, and `/terms`. Unknown paths show the branded 404 page.

## Product and workflow pages

- `/workflow-comparison` describes common manual document-work steps alongside TaxFlow's intended workflow. It is qualitative—not a measured time-saving claim—and marks internal testing, human review, and roadmap status.
- `/get-app` explains the product's availability. The install call to action clearly says the app is coming soon and links to the waitlist; it does not imply a download is available.
- `/portal` is the invited-client file upload portal. Portal access is granted by the practice from the desktop app; the portal does not permit public account creation.
- `/privacy` and `/terms` describe the marketing site, waitlist, and client portal data flows. They do not claim an independent security certification or replace a signed service agreement.

## Connect the existing Supabase project

The website uses the same Supabase project as the TaxFlow app. The marketing waitlist uses its own `public.website_waitlist` table. The separate `/portal` page uses Supabase Auth for invited clients and sends file bytes to the Taxflow backend; it does not read Supabase Storage directly from the browser.

1. In the existing TaxFlow Supabase project, open **SQL Editor → New query**.
2. Run the complete migration in [`supabase/website_waitlist.sql`](./supabase/website_waitlist.sql). It creates the waitlist table and indexes, validates consent and submitted fields, and exposes a narrowly scoped RPC function. Anonymous website visitors can submit but cannot read or edit waitlist records. The migration is safe to re-run.
3. In **Project Settings → API Keys**, copy that project's **Project URL** and **Publishable key** (or its legacy `anon` key). Do not use the service-role key.
4. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   SUPABASE_URL=the-existing-project-url
   SUPABASE_ANON_KEY=the-existing-project-publishable-or-anon-key
   ```

5. Restart the local Vite server. Without these public settings, the form clearly labels submissions as browser-only preview data; it does not claim they were sent.

## Configure the client portal

1. Follow the root [`BACKEND_GUIDE.md`](../BACKEND_GUIDE.md) client-portal deployment steps. Apply `services/backend/db/client_portal.sql` after the base schema and private storage-bucket migration, and make sure `services/backend/db/create_api_rate_limits.sql` has been applied.
2. On the backend, set `CLIENT_PORTAL_URL` to the exact website origin (HTTPS in production) and set `SUPABASE_STORAGE_BUCKET` to the private intake bucket. The backend must use the service-role key; never copy it into this website.
3. On the website, set `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the existing project's public values, and set `API_URL` to the backend origin. The public Supabase key is used only for email-link sign-in; all access checks and uploads are performed by the backend.
4. In Supabase Auth, configure email delivery and allowlist the website's `/portal` URL as an email redirect. Invite a client from the desktop app after verifying their email address in the client record.
5. Verify the bucket is private and test an invitation, a small supported file upload, desktop sync, access revocation, and rejection of an oversized or unsupported file before production use.

Portal uploads are stored in private Supabase Storage and copied by the existing desktop sync into the configured local vault. Hosting, API, and storage providers process data to operate the service. The portal uses HTTPS in production and does not send uploaded files through Telegram. This setup is not an independent security audit or a guarantee against all security incidents.

For Vercel, use the names `SUPABASE_URL` and `SUPABASE_ANON_KEY` without the `VITE_` prefix, and set their type to **Config** when asked. Vite's build configuration explicitly passes only these two named public values to the browser; it does not expose other `SUPABASE_*` variables. The Supabase URL and Publishable/legacy anon key are public browser configuration—not secrets—so they will be present in the deployed JavaScript. Never use a Supabase secret key (`sb_secret_...`) or `SUPABASE_SERVICE_ROLE_KEY` here. Remove any old `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` entries from Vercel after adding the replacement variables.

The form calls `public.join_website_waitlist` with the required consent and optional name, firm, role, country, and firm-size fields. Duplicate emails are accepted without disclosing whether an address is already on the list. The RPC stores a submission; it does not send an email. Add a server-side email provider or Supabase Edge Function separately if email notifications are required.

An optional `VITE_WAITLIST_ENDPOINT` can be used instead of Supabase RPC; if set, it takes precedence and must be an HTTPS endpoint that accepts the documented waitlist JSON fields. Never put private credentials in a `VITE_*` variable.

Waitlist entries can be managed from the existing project's Supabase dashboard or SQL Editor by an authorized administrator. Do not grant public `SELECT` access or place the service-role key in frontend code.

## Deploy with Vercel

Import this website repository into Vercel and configure:

- **Framework preset:** Vite
- **Root directory:** `./` (the repository root)
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** `SUPABASE_URL` and `SUPABASE_ANON_KEY`, using the same existing Supabase project values as local development. Set them as **Config** values, and add them for each Vercel environment you use.

These are public browser configuration values, not secrets. Vite explicitly embeds only these two named variables in the site; other Supabase environment values such as a service-role key are not passed through. Use only the Supabase Project URL and Publishable key (or legacy anon key). Delete any previous `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` entries, then redeploy after adding or changing the new Config variables.

The Vercel configuration rewrites the `/product`, `/waitlist`, `/get-app`, `/workflow-comparison`, `/portal`, `/privacy`, and `/terms` application routes to the Vite entry point. Other unknown paths use the branded `public/404.html` page. Add the production `/portal` URL to Supabase Auth's redirect allowlist when using the client portal.

## Build

```bash
npm run build
npm run preview
```

## Accessibility and product accuracy

The theme toggle supports light and dark mode, remembers the selection in this browser, and otherwise follows the operating-system preference. Scroll and ambient animations respect `prefers-reduced-motion`.

The product page distinguishes the PRD's vision and roadmap from the current working demo. Workflow comparisons are qualitative and do not claim measured time savings or accuracy results. No customer logos, security certifications, or product capabilities beyond the PRD are asserted.

**Before launch:** consider abuse/rate-limit protection (such as CAPTCHA) for the public submission function, configure a retention process for submitted personal data, and test the production waitlist with the deployed domain. Never expose `SUPABASE_SERVICE_ROLE_KEY` in any `VITE_*` setting.
