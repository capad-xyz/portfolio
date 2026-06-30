# Contact form — how it works

A floating "Message" button (`ContactWidget`) sits bottom-right on every page. Clicking it opens a glass modal with name/email/message. Submitting POSTs `/api/contact`, which sends the email via Resend, `From: contact@capad.fyi`. The visitor's address goes in `Reply-To`, so hitting reply in Gmail replies to them.

## The pieces

```
[browser]                    [Next.js]                 [Resend]              [Gmail]
ContactWidget  --POST JSON--> /api/contact route  --POST--> api.resend.com --SMTP--> connect@capad.fyi
                                                                                          |
                                                                              (Cloudflare Email Routing)
                                                                                          v
                                                                                    your Gmail
```

A few notes on the architecture:

- **A Next.js Route Handler IS a Cloudflare-Worker-shaped function.** Both are `(Request) => Response` handlers running on a server. Cloudflare hosts theirs at the edge; Next.js Route Handlers run on whatever you deploy to (Vercel, Cloudflare Pages, a VPS). The code shape is identical. We picked Route Handler because the rest of the portfolio is already Next.js — one host, one deploy.
- **Why Resend and not MailChannels?** The original "Cloudflare Worker + MailChannels" pattern was free until Aug 2024, when MailChannels closed the free relay. Resend has a 3k email/month free tier and lets us send from `contact@capad.fyi` once the domain is verified, which keeps the "this came from my portfolio" feel.
- **Why a separate sending domain instead of just SMTP-ing from Gmail?** Sending as `contact@capad.fyi` (via Resend, with proper SPF/DKIM/DMARC) is what stops messages from landing in spam. Gmail SMTP from your personal address would work but every reply chain would expose your raw Gmail.

## One-time setup

### 1. Resend account + verified domain

1. Sign up at https://resend.com (Google login is fine).
2. **Domains** -> Add Domain -> `capad.fyi`. Resend hands you 3 DNS records (SPF/TXT, DKIM/TXT, optionally DMARC/TXT).
3. **Cloudflare dashboard for capad.fyi** -> DNS -> Add record. Paste the records Resend gave you, exactly. Set proxy status to **DNS only** (grey cloud), not proxied.
4. Back in Resend, click "Verify". Takes ~5 minutes for DNS to propagate.

### 2. Create an API key

Resend -> **API Keys** -> Create. Permission: "Sending access" to the `capad.fyi` domain. Copy the key (`re_...`) — it's shown once.

### 3. Add the key locally

In `C:\Users\Aadarsh Upadhyay\Desktop\capad-portfolio\.env.local`:

```
RESEND_API_KEY=re_your_key_here
```

(`.env.local` is already gitignored.)

Restart `npm run dev` so Next picks up the env.

### 4. Production env

Wherever you deploy (Vercel/Cloudflare Pages/etc.), add `RESEND_API_KEY` to that environment's secrets.

## Testing it

1. `npm run dev`, open http://localhost:3030.
2. Click the floating "Message" button bottom-right.
3. Fill it in with your own email, send.
4. Email should land in your Gmail within seconds, From: `Portfolio <contact@capad.fyi>`, Reply-To: whatever you typed.

If something goes wrong, look at the terminal — the route handler logs Resend's exact error on failure.

## Knobs

In [`src/app/api/contact/route.ts`](../src/app/api/contact/route.ts):

- `FROM` — the address shown as sender. Must be on a Resend-verified domain.
- `TO` — your inbox. Hardcoded to your Gmail.
- `LIMIT` / `WINDOW_MS` — per-IP rate limit (currently 5 messages per hour). In-memory map; resets on server restart. Fine for a portfolio.
- The hidden `website` honeypot field — bots fill all fields, humans don't see this one. If it's non-empty we accept the request but silently drop it.

## What this does NOT do

- No persistent storage. If the Resend API call fails, the message is lost (the user sees an error and is told to email directly).
- No captcha. The honeypot + rate limit + the friction of typing a real message handles 99% of bot traffic. If you ever get spammed, add Cloudflare Turnstile in front.
