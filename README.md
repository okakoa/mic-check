# MicCheck – Online Microphone Test

One page, one button, one answer: "Is my microphone working?"
Plain HTML + one CSS file + one JS file. No frameworks, no web fonts, no backend.
Audio is processed in the browser and never leaves the device.

```
public/
  index.html          the tool + How it works + troubleshooting + FAQ (+ JSON-LD)
  styles.v1.css       all styles (versioned filename → cached for 1 year)
  app.v1.js           mic test, GA4 + Consent Mode v2, ad loader (versioned)
  config.js           ← THE ONLY FILE YOU EDIT for GA4 / ads / consent (no-cache)
  about.html  privacy.html  terms.html  404.html
  robots.txt  sitemap.xml  llms.txt  ads.txt
  favicon.svg  icon-192.png  icon-512.png  og-image.png  site.webmanifest
  sw.js               empty placeholder (only for Monetag push – OFF)
scripts/
  set-site.mjs        replace domain / email / owner name everywhere
  make-images.py      regenerate icons + OG image (needs Pillow)
firebase.json  .firebaserc
```

---

## 1. Run locally

The microphone only works on **https** or **localhost**.

```powershell
npm i -g firebase-tools
firebase emulators:start --only hosting --project demo-mic-check
# open http://localhost:5000
```

Any static server also works, e.g. `npx serve public` (open the `localhost` URL, not your LAN IP).

> Note: on Windows, the Firebase hosting emulator does not apply the custom `headers`
> from firebase.json (path-separator bug in its glob library). They work in production.

## 2. Deploy to Firebase Hosting

```powershell
npm i -g firebase-tools
firebase login
firebase projects:create mic-check-yourname      # or create it in console.firebase.google.com
firebase use --add                                # choose the project, alias "default"
firebase deploy --only hosting
```

`firebase init hosting` is optional: this repo already contains `firebase.json` and `.firebaserc`.
If you do run it, answer: public directory **public**, single-page app **No**, GitHub deploys **No**,
and **do not overwrite** `public/index.html` or `public/404.html`.

After deploying, your site is live at `https://<project-id>.web.app`.

### Set your real URL, email and name (do this before launch)

All pages use the placeholder `https://mic-check.web.app`, `hello@YOUR-DOMAIN.com` and `YOUR NAME`.

```powershell
node scripts/set-site.mjs --url https://<project-id>.web.app --email you@example.com --name "Your Name"
# later, when the custom domain is ready:
node scripts/set-site.mjs --url https://your-domain.com --email hello@your-domain.com
```

Also update `.firebaserc` with your project ID.

## 3. Connect a custom domain

1. Firebase Console → your project → **Hosting** → **Add custom domain**.
2. Enter `your-domain.com` (and optionally `www.your-domain.com`, set to redirect to the apex).
3. Add the **TXT** (ownership) and **A** records Firebase shows at your domain registrar.
4. Wait for verification and the free SSL certificate (minutes to 24 h).
5. Run `set-site.mjs --url https://your-domain.com`, then `firebase deploy --only hosting`.
6. Submit `https://your-domain.com/sitemap.xml` in Google Search Console.

---

## 4. Where to paste your IDs (all in `public/config.js`)

| What | Where in `config.js` | Also |
|---|---|---|
| GA4 Measurement ID `G-…` | `GA4_ID` | – |
| AdSense publisher ID `ca-pub-…` | `ADS.adsense.client`, plus ad-unit IDs in `slotA` / `slotB` | Uncomment the AdSense block in `index.html` `<head>` (replace both `ca-pub-XXXXXXXXXXXXXXXX`), fix the line in `ads.txt` |
| Adsterra | `ADS.adsterra.bannerKey` (728x90), `bannerKeyMobile` + `mobileSize` (300x250 or 320x50), `bannerHost`, `nativeKey` + `nativeSrc` (Native Banner), `socialBar` / `socialBarSrc` (off) | Paste Adsterra's ads.txt line |
| Monetag | `ADS.monetag.zoneTag` – paste the whole In-Page Push or banner `<script>` tag | Paste Monetag's ads.txt line, complete their site verification |

How to read an Adsterra banner code: in
`atOptions = {'key' : 'abc123…'} … src="//www.highperformanceformat.com/abc123…/invoke.js"`
the key is `abc123…` and `bannerHost` is `//www.highperformanceformat.com`.
For the Native Banner, copy the full `src` URL into `nativeSrc` and the key from `container-<key>` into `nativeKey`.

### Switch ad provider

Change one line: `provider: "none" | "adsense" | "adsterra" | "monetag"`, then deploy.
`config.js` is served with `no-cache`, so visitors get the change immediately.

- `"none"` hides both ad slots completely (use this while applying to AdSense).
- Ads load only after the page has loaded and never above or next to the button/result/playback (slot A keeps 150px+ distance).
- In EEA/UK/CH (time-zone guess), Adsterra/Monetag load only after the visitor presses **Accept**. AdSense waits for a choice and uses non-personalized ads after **Reject**.
- Monetag Popunder, Direct Link and Push are deliberately not supported. Push would need `public/sw.js` – replace the placeholder with Monetag's file only if you really want it (not recommended with AdSense).

### Consent

- Google Consent Mode v2 defaults are set in `app.v1.js`: everything **denied** in EEA/UK/CH, granted elsewhere; updated when the visitor chooses.
- The built-in banner (Accept / Reject) shows to visitors whose time zone looks European. Set `CONSENT.showTo = "all"` to show it to everyone.
- When you switch on Google's certified CMP (AdSense → **Privacy & messaging** → European regulations), set `CONSENT.banner = "none"`. The marked spot is in the `<head>` of `index.html`.

### GA4 events

`test_started`, `test_result` (`result`: `working | silent | blocked | no_device | busy | unsupported`), `playback_clicked`.
In GA4, register `result` as a custom dimension (Admin → Custom definitions) to see it in reports.

---

## 5. Changing CSS/JS (cache busting)

`styles.v1.css` and `app.v1.js` are cached for one year. When you edit them, rename to `.v2.` and update the
`<link>` / `<script>` tags in every HTML file. Icons (`.png/.svg`) are cached the same way: rename if you change them.

## 6. Tuning

In `app.v1.js` → Settings: `TEST_MS` (5 s), `RECORD_MS` (4 s), `WORKING_PEAK` (20/100, ≈ −48 dBFS).
Level mapping: −60 dBFS → 0, 0 dBFS → 100.

---

## 7. Pre-launch checklist

- [ ] `set-site.mjs` run with your real URL, email and name; `.firebaserc` project ID set
- [ ] About page names a real person/company and a working email
- [ ] "Last updated" dates in `index.html`, `privacy.html`, `terms.html`, `sitemap.xml` are current
- [ ] GA4 ID set; real-time report shows a visit and a `test_result` event
- [ ] `ADS.provider` is `"none"` while applying to AdSense
- [ ] `ads.txt` contains only valid lines (comment out the AdSense placeholder if not using AdSense)
- [ ] Deployed over https; mic prompt appears; red recording dot disappears after the test
- [ ] Tested: Chrome (desktop + Android), Safari (Mac + iOS), Firefox, Edge
- [ ] Tested: permission denied, no microphone, mic busy in another app (e.g. during a call on Windows), muted mic → "heard almost nothing"
- [ ] Lighthouse (mobile) ≥ 95 in all four categories
- [ ] Rich Results Test passes for FAQ + WebApplication (search.google.com/test/rich-results)
- [ ] Search Console: domain verified, sitemap submitted
- [ ] No broken links (footer: About · Privacy · Terms · email)
- [ ] Optional: add a Content-Security-Policy once the ad network is final (TODO in `index.html`)

## Setting up the ad accounts (your part)

Deploy first, then apply – every network reviews a live site.

1. **Google Analytics:** analytics.google.com → create property → Web stream with your domain → copy `G-…` into `config.js`.
2. **AdSense:** adsense.google.com → add site → paste `ca-pub-…` → uncomment the head script → fix `ads.txt`. Approval can take days to weeks; tiny sites are often rejected as "low-value content", which is why the page has real how-it-works, troubleshooting and FAQ text.
3. **Adsterra:** sign up as Publisher → add website → create Banner (300x250 / 728x90) and Native Banner units → paste keys → add their ads.txt line.
4. **Monetag:** sign up as Publisher → add site → complete the ownership check → create an In-Page Push or banner zone → paste its tag.

Pick one strategy. A sensible path: start with Adsterra banners, apply to AdSense once you have traffic (with `provider: "none"` during review), and switch if approved. Avoid popunders, redirects and push prompts – they are a common reason for AdSense rejection and annoy visitors of a one-button tool.

