# MicCheck – Implementation Plan

Status as of **November 1, 2026**: Phases 1, 2, 3, 5, and 6 are **live and completed** on https://mic-check-tool.web.app (GA4 `G-JXDQL7L7HZ`, Google Search Console & Bing Webmaster Tools verified, and Adsterra banners displaying on desktop and mobile).

> Details for each step are in [README.md](README.md). All analytics, ad and consent settings live in one file: `public/config.js`.

---

## Phase 1 – Personalize (before the first deploy) ✅ Completed

- [x] Decide on the site name (**MicCheck**) and your contact email (`onepagewebapps@gmail.com`).
- [x] Create a real contact inbox (`onepagewebapps@gmail.com`).
- [x] Replace the placeholders across all pages (`One Page Web Apps`, `onepagewebapps@gmail.com`).
- [x] Check `public/about.html` reads well with your name and a sentence about you.
- [x] In `public/ads.txt`, comment out (`#`) the AdSense placeholder line until you have a real publisher ID.
- [x] Optional: commit the project to Git (`git init`, first commit) so you can undo changes.

## Phase 2 – Deploy to Firebase Hosting ✅ Completed

- [x] Create a Firebase project (`mic-check-tool`).
- [x] Put the project ID in `.firebaserc` (`mic-check-tool`) and update URLs across all pages to `https://mic-check-tool.web.app`.
- [x] Deploy to Firebase Hosting (`firebase deploy --only hosting`).
- [x] Open `https://mic-check-tool.web.app` and check that:
  - [x] The mic prompt appears, the test gives an answer, and playback works (tested on real phone microphone)
  - [x] The browser's red recording dot disappears after the test
  - [x] /about, /privacy, /terms and a bad URL (404 page) all load
  - [x] Headers are live (`Permissions-Policy: microphone=(self)`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Cache-Control: immutable` on `.v1.` assets)

## Phase 3 – Real-device & Cross-browser testing ✅ Completed

- [x] Chrome and Edge on Windows/Mac (verified on live site `https://mic-check-tool.web.app`)
- [x] Safari on Mac (permission instructions & Web Audio compatibility verified)
- [x] Safari on iPhone/iPad (MP4/AAC `MediaRecorder` fallback & iOS permission instructions verified)
- [x] Chrome and Samsung Internet on Android (verified on real Android phone + `app.v2.js` device label fix)
- [x] Firefox (desktop permission instructions & Opus/Ogg `MediaRecorder` support verified)
- [x] Failure cases:
  - [x] Permission denied → `"❌ Microphone access was blocked."` + the right browser steps
  - [x] No microphone → `"❌ No microphone was found on this device."`
  - [x] Mic busy → `"❌ Your microphone is being used by another app. Close it and try again."`
  - [x] Muted mic → `"⚠️ Your microphone is connected but we heard almost nothing. It may be muted, too quiet, or the wrong mic is selected."`
- [x] Threshold check (`WORKING_PEAK = 20 / 100`): verified on real phone mic (peaked at `79 / 100`).

## Phase 4 – Custom domain (optional but recommended)

- [ ] Buy the domain.
- [ ] Firebase Console → Hosting → **Add custom domain** → add the TXT and A records at your registrar.
- [ ] Wait for the SSL certificate to be issued.
- [ ] Re-run `node scripts/set-site.mjs --url https://your-domain.com --email hello@your-domain.com`, then deploy again.

## Phase 5 – Search and analytics ✅ Completed

- [x] Google Analytics: create a GA4 property + Web stream → paste `G-JXDQL7L7HZ` into `GA4_ID` in `config.js` → deploy.
- [x] GA4 → Admin → Custom definitions → register `result` as an event-scoped custom dimension (optional dashboard view).
- [x] Confirm `test_started`, `test_result` (`{ result: "working" }`) and `playback_clicked` fire and send to `G-JXDQL7L7HZ` (verified in GA4 Realtime on mobile & desktop).
- [x] Google Search Console: verified `https://mic-check-tool.web.app` via HTML `<meta>` tag and submitted `/sitemap.xml`.
- [x] Rich Results / JSON-LD check: verified `WebApplication`, `Organization`, and `FAQPage` schemas on live page.
- [x] Run Lighthouse (mobile) on the live URL and confirm 95+ in every category (**Performance: 99, Accessibility: 100, Best Practices: 100, SEO: 100**).

## Phase 6 – Monetization (pick ONE path) ✅ Completed (Adsterra Active)

Recommended order: start with Adsterra banners → build traffic → apply to AdSense with ads off → switch if approved.

**Adsterra (active)**
- [x] Sign up as a Publisher, add the site, create a Banner unit (`728x90` + `300x250`) and a Native Banner.
- [x] Paste the keys/URLs into `ADS.adsterra` in `config.js`, set `provider: "adsterra"`, and deploy (`app.v3.js`, `styles.v2.css`).
- [x] Confirmed ads are rendering live on both desktop (`728x90` + Native Banner) and mobile (`300x250` + Native Banner) devices.
- [ ] Optional: if Adsterra provides `ads.txt` lines under Websites → `ads.txt`, paste them into `public/ads.txt` and deploy.

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

