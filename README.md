# The Luna Project

The official website for **Luna Wilmington Arts Academy** — a donation-supported, multicultural arts academy founding in 2026 in Wilmington, Delaware.

Public name: **Luna Art Academy** · Legal name: *Luna Wilmington Arts Academy, Inc.*

> *Where Wilmington creates together.*

---

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero, pillars, founder, events, donate tease |
| `about.html` | Mission, vision, values, founder story, board, year-one timeline |
| `programs.html` | The three pillars: Music, Painting, Rotating Method + class schedules |
| `events.html` | Featured event + filterable calendar + RSVP modal |
| `artists.html` | Featured artist + filterable roster of 12 founding instructors |
| `get-involved.html` | Volunteer, instructor, board, sponsor, in-kind, partnership forms |
| `donate.html` | 3-step Founding Circle flow + FAQ + funding mix |
| `contact.html` | Address, hours, message form, map, press, socials |

## Assets

- `assets/logo.png` — The Luna moon logo (provided)
- `assets/tokens.css` — Design system: color, type, spacing tokens
- `assets/site.css` — Shared component styles (nav, footer, forms, modals, cards)
- `assets/site.js` — Shared behavior (scroll reveals, modals, donation flow, filters, parallax)

## Brand system

Pulled directly from the logo:

- **Inks** — deep aubergine `#2A1538`, purple `#6B2D8C`, `#3F1A55`
- **Brand** — moon yellow `#F5C518`, gold `#E9A93C`, rose/magenta `#D6336C`, teal `#1F8A8C`, orange `#F58A1F`, terracotta `#C25928`
- **Surfaces** — warm bone `#FBF6EC`, cream `#F3E8D4`
- **Type** — *Cinzel Decorative* (display, art-nouveau feel matching the logo's "LUNA"), *Cormorant Garamond* (serif body, italics for voice), *DM Sans* (clean sans for UI and navigation)

Aesthetic direction: **Warm & folkloric** — multicultural, painterly, gallery-quality. Painterly placeholder gradients stand in for photography until real class photos exist.

## Interactivity

- Scroll-triggered section reveals
- Hero parallax (drifting moon, floating stars, swirl flourishes)
- Mock donation flow (tier select → details → confirmation, with live summary, formatted card mock, and step indicator)
- Event RSVP modal (with success state)
- Newsletter signup form
- Volunteer / instructor / board / partner application forms
- Contact form
- Filterable event calendar and artist roster

All forms are **mocked** — they validate and show a success state but do not submit anywhere. Wire up to a backend (Formspree, Netlify forms, your own API, etc.) before launch.

---

## Deployment

### Vercel

The site is a pure static HTML/CSS/JS project. No build step.

1. Push to GitHub.
2. In Vercel, **Import Project** → select the repo.
3. Framework Preset: **Other** · Build Command: *(leave empty)* · Output Directory: `./`
4. Deploy. Custom domain via the Vercel dashboard.

A `vercel.json` is included with sensible defaults.

### Anywhere else

It's static HTML — drop the entire folder on any host (GitHub Pages, Netlify, Cloudflare Pages, S3, your own server).

---

## Before going live

- [ ] Replace painterly placeholders with real photography as classes happen
- [ ] Wire forms to a real backend (Formspree, Netlify Forms, or custom)
- [ ] Replace donation flow with real Stripe / GiveButter / GiveLively integration
- [ ] Add real Instagram / TikTok / Facebook / YouTube URLs (search for `#` href in `contact.html`)
- [ ] Confirm legal disclosure copy with a nonprofit attorney
- [ ] Add Google Analytics / Plausible / Fathom snippet
- [ ] Add Open Graph / Twitter card images
- [ ] Verify all email addresses (`hello@`, `alejandra@`, `press@`)
- [ ] Real Whale Building street address once lease is signed
- [ ] Replace placeholder artist names with real founding instructors as they sign on
- [ ] Real `favicon.ico` derived from the logo

---

## Legal

Luna Wilmington Arts Academy, Inc. is a Delaware nonprofit corporation seeking 501(c)(3) tax-exempt status. Donor disclosure language appears in the footer of every page per Delaware solicitation requirements.

© 2026 Luna Wilmington Arts Academy, Inc. · Wilmington, Delaware.
