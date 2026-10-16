# kots

Marketing site for KOTS Group Investments (Harare) — air conditioning, commercial refrigeration and plumbing.

Astro 7 + Tailwind v4, deployed to Cloudflare Workers (static assets + one server route for the enquiry form).

## Develop

```sh
nvm use            # Node 24 (.nvmrc)
npm install
npm run dev
npm run build      # outputs dist/
npm run preview    # runs the built Worker locally via wrangler
```

## Content

All business facts (name, phones, email, service wording) live in `src/site.ts` and the page files under `src/pages/`. The copy was taken from the KOTS company profile; do not add claims that are not in it.

Images in `public/images/` are placeholders lifted from the profile PDF — replace with real job photos.

## Enquiry form

`POST /api/enquiry` (`src/pages/api/enquiry.ts`) emails the enquiry via Resend. Secrets (set with `wrangler secret put` or in the Cloudflare dashboard):

| Secret | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. Without it the endpoint returns 503 and the browser falls back to opening WhatsApp with the enquiry prefilled. |
| `ENQUIRY_TO` | Recipient. Defaults to `kotsgroupinvestments@gmail.com`. |
| `ENQUIRY_FROM` | Sender, must be on a domain verified in Resend, e.g. `KOTS Website <enquiries@kotsgroup.com>`. |

Inputs are length-capped, control characters are stripped, there is a honeypot field, and HTML is escaped before it is put in the email.

## Deploy

```sh
npx wrangler login
npm run build && npx wrangler deploy
```

Then add `kotsgroup.com` as a custom domain on the Worker in the Cloudflare dashboard.
