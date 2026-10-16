# kots

Marketing site for KOTS Group Investments (Harare) — air conditioning, commercial refrigeration and plumbing.

Astro 7 + Tailwind v4, deployed on Vercel (static pages + one serverless route for the enquiry form). Node 24.

## Develop

```sh
nvm use            # Node 24 (.nvmrc)
npm install
npm run dev
npm run build      # outputs dist/
npm run preview    # serves the build locally
```

## Content

All business facts (name, phones, email, service wording) live in `src/site.ts` and the page files under `src/pages/`. The copy was taken from the KOTS company profile; do not add claims that are not in it.

Images in `public/images/` are placeholders lifted from the profile PDF — replace with real job photos.

## Enquiry form

`POST /api/enquiry` (`src/pages/api/enquiry.ts`) emails the enquiry via Resend. Environment variables (Vercel project → Settings → Environment Variables):

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. Without it the endpoint returns 503 and the browser falls back to opening WhatsApp with the enquiry prefilled. |
| `ENQUIRY_TO` | Recipient. Defaults to `kotsgroupinvestments@gmail.com`. |
| `ENQUIRY_FROM` | Sender, must be on a domain verified in Resend, e.g. `KOTS Website <enquiries@kotsgroup.com>`. |

Inputs are length-capped, control characters are stripped, there is a honeypot field, and HTML is escaped before it is put in the email.

## Deploy

The Vercel project `kots` (team `emans-projects-24fbaa83`) is connected to this GitHub repo; pushes to `main` deploy to production. Add `kotsgroup.com` under the project's Domains once registered.
