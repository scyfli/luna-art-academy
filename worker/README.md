# Luna Forms Worker

Cloudflare Worker that receives website form posts and emails them via Resend
to the right inbox. Deployed separately from the static site (Vercel ignores
this folder via `.vercelignore`).

## Routing
| formType | inbox |
| --- | --- |
| contact, newsletter, rsvp, volunteer | info@lunaartsacademy.org |
| instructor, board | alejalafaro@lunaartsacademy.org |
| partner | mark@lunaartsacademy.org |

## Deploy (one-time setup)

```bash
cd worker
npx wrangler login          # one-time browser auth
npx wrangler deploy         # publishes luna-forms.<subdomain>.workers.dev
npx wrangler secret put RESEND_API_KEY   # paste the Resend key when prompted
```

Then note the deployed URL (e.g. `https://luna-forms.<subdomain>.workers.dev`)
and confirm it matches `FORM_ENDPOINT` in `assets/site.js`.

## Prerequisites for real email delivery
- Verify `lunaartsacademy.org` as a sending domain in Resend (add the
  DKIM/SPF/return-path DNS records to Cloudflare). Until then Resend only
  delivers to the account owner's address.

## Spam protection
- Honeypot field `_gotcha` (hidden in the form). If filled, the Worker returns
  success and silently drops the message.
- Origin allowlist in `luna-forms.js`.
