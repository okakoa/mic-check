# MicCheck – Implementation Plan

Status as of **November 1, 2026**: the site is built and tested locally (Lighthouse mobile scored 100 in all four categories). Nothing is deployed yet. These are the remaining tasks, in order.

> Details for each step are in [README.md](README.md). All analytics, ad and consent settings live in one file: `public/config.js`.

---

## Phase 1 – Personalize (before the first deploy) ✅ Completed

- [x] Decide on the site name (**MicCheck**) and your contact email (`onepagewebapps@gmail.com`).
- [x] Create a real contact inbox (`onepagewebapps@gmail.com`).
- [x] Replace the placeholders across all pages (`One Page Web Apps`, `onepagewebapps@gmail.com`).
- [x] Check `public/about.html` reads well with your name and a sentence about you.
- [x] In `public/ads.txt`, comment out (`#`) the AdSense placeholder line until you have a real publisher ID.
- [x] Optional: commit the project to Git (`git init`, first commit) so you can undo changes.

## Phase 2 – Deploy to Firebase Hosting

- [ ] Create a Firebase project at console.firebase.google.com (note the project ID).
- [ ] Put the project ID in `.firebaserc` (replace `mic-check`).
- [ ] Deploy:
  ```powershell
  firebase login
  firebase use --add
  firebase deploy --only hosting
  ```
- [ ] Open `https://<project-id>.web.app` and check that:
  - [ ] The mic prompt appears, the test gives an answer, and playback works
  - [ ] The browser's red recording dot disappears after the test
  - [ ] /about, /privacy, /terms and a bad URL (404 page) all load
  - [ ] Headers are live (DevTools → Network → document → `Permissions-Policy`, `Cache-Control`)

## Phase 3 – Real-device testing

- [ ] Chrome and Edge on Windows/Mac
- [ ] Safari on Mac
- [ ] Safari on iPhone/iPad (check playback works)
- [ ] Chrome and Samsung Internet on Android
- [ ] Firefox (desktop)
- [ ] Failure cases:
  - [ ] Permission denied → "access was blocked" + the right browser steps
  - [ ] No microphone → "No microphone was found"
  - [ ] Mic busy (e.g. in a Teams/Zoom call on Windows) → "being used by another app"
  - [ ] Muted mic → "heard almost nothing"
- [ ] If a quiet-but-working mic is wrongly called "silent", lower `WORKING_PEAK` in `app.v1.js` (rename the file to `app.v2.js` and update `index.html`).

## Phase 4 – Custom domain (optional but recommended)

- [ ] Buy the domain.
- [ ] Firebase Console → Hosting → **Add custom domain** → add the TXT and A records at your registrar.
- [ ] Wait for the SSL certificate to be issued.
- [ ] Re-run `node scripts/set-site.mjs --url https://your-domain.com --email hello@your-domain.com`, then deploy again.

## Phase 5 – Search and analytics

- [ ] Google Analytics: create a GA4 property + Web stream → paste the `G-…` ID into `GA4_ID` in `config.js` → deploy.
- [ ] GA4 → Admin → Custom definitions → register `result` as an event-scoped custom dimension.
- [ ] Confirm `test_started`, `test_result` and `playback_clicked` show in the GA4 real-time report.
- [ ] Google Search Console: verify the domain and submit `/sitemap.xml`.
- [ ] Rich Results Test (search.google.com/test/rich-results): check FAQ + WebApplication pass.
- [ ] Run Lighthouse (mobile) on the live URL and confirm 95+ in every category.

## Phase 6 – Monetization (pick ONE path)

Recommended order: start with Adsterra banners → build traffic → apply to AdSense with ads off → switch if approved.

**Adsterra (fastest start)**
- [ ] Sign up as a Publisher, add the site, create a Banner unit (728x90 + 300x250 or 320x50) and a Native Banner.
- [ ] Paste the keys/URLs into `ADS.adsterra` in `config.js`, set `provider: "adsterra"`.
- [ ] Add Adsterra's line to `ads.txt`, then deploy.

**AdSense (when you have some traffic)**
- [ ] Set `provider: "none"` while under review.
- [ ] Apply at adsense.google.com with your `ca-pub-…` ID.
- [ ] Uncomment the AdSense block in the `<head>` of `index.html` (replace both `ca-pub-XXXXXXXXXXXXXXXX`).
- [ ] Fix and uncomment the AdSense line in `ads.txt`, then deploy.
- [ ] Once approved: create ad units → paste IDs into `ADS.adsense.slotA` / `slotB` → set `provider: "adsense"`.
- [ ] Turn on AdSense **Privacy & messaging** (certified consent message for EEA/UK/CH), then set `CONSENT.banner = "none"`.

**Monetag (only if you choose it instead)**
- [ ] Complete site verification, create an In-Page Push or banner zone, paste the tag into `ADS.monetag.zoneTag`.
- [ ] Keep popunders, redirects and push notifications OFF (they risk AdSense rejection and annoy visitors).

## Phase 7 – Ongoing maintenance

- [ ] After any content change: update the "Last updated" dates (`index.html`, `privacy.html`, `terms.html`) and `lastmod` in `sitemap.xml`.
- [ ] After editing CSS/JS: bump the version in the filename (`.v1.` → `.v2.`) and update every HTML file.
- [ ] If the FAQ changes, update the matching FAQ JSON-LD in `index.html` word for word.
- [ ] Once the ad network is final: add a Content-Security-Policy header (TODO in `index.html`).
- [ ] Monthly: check GA4 (how many tests, share of "blocked"/"silent" results) and Search Console (search terms, errors).
- [ ] Ideas to grow traffic later: add more helpful text for common search terms (e.g. "Bluetooth headset mic not working"), keeping it to one page.

---

## Quick reference

| Task | File / command |
|---|---|
| GA4 ID, ad provider, ad keys, consent | `public/config.js` |
| AdSense head script | `public/index.html` `<head>` (commented out) |
| Seller lines | `public/ads.txt` |
| Domain / email / name everywhere | `node scripts/set-site.mjs …` |
| Icons + social image | `python scripts/make-images.py` |
| Local preview | `firebase emulators:start --only hosting --project demo-mic-check` → http://localhost:5000 |
| Deploy | `firebase deploy --only hosting` |

