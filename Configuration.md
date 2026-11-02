# MicCheck – Project Configuration Reference

Last updated: **November 1, 2026**

This document records all live accounts, URLs, identifiers, configuration settings, and hosting headers for the **MicCheck** project.

---

## 1. Identity & Accounts

| Item | Value |
|---|---|
| **Site Name** | MicCheck |
| **Owner / Publisher Name** | One Page Web Apps |
| **Public Contact Email** | `onepagewebapps@gmail.com` |
| **Live Production URL** | https://mic-check-tool.web.app |
| **Firebase Project ID** | `mic-check-tool` |
| **Firebase Account (CLI)** | `okakoa@gmail.com` |
| **Firebase Console** | https://console.firebase.google.com/project/mic-check-tool/overview |
| **GitHub Repository** | https://github.com/okakoa/mic-check |
| **Git Default Branch** | `main` |
| **Local Git Author** | `One Page Web Apps <onepagewebapps@gmail.com>` |

---

## 2. Runtime Configuration (`public/config.js`)

[`public/config.js`](public/config.js) is the single runtime configuration file for analytics, consent, and advertising. It is served with `Cache-Control: no-cache` so changes take effect immediately upon deploy without renaming assets.

### Current Settings

| Setting | Current Value | Purpose |
|---|---|---|
| `GA4_ID` | `"G-JXDQL7L7HZ"` | Live Google Analytics 4 Measurement ID for `mic-check-tool.web.app`. |
| `CONSENT.banner` | `"builtin"` | Shows the built-in lightweight Accept / Reject banner. Change to `"none"` if switching to Google's certified AdSense CMP. |
| `CONSENT.showTo` | `"eea"` | Shows the banner to visitors in EEA/UK/CH time zones (Consent Mode v2 defaults to `"denied"` in EEA/UK/CH). Change to `"all"` to show globally. |
| `ADS.provider` | `"none"` | Active ad network: `"none"` \| `"adsense"` \| `"adsterra"` \| `"monetag"`. Keep as `"none"` while applying for AdSense. |

### Ad Provider Configuration Keys (`ADS` object in `public/config.js`)

- **AdSense (`ADS.adsense`):**
  - `client`: `"ca-pub-XXXXXXXXXXXXXXXX"` (also uncomment `<head>` tags in `public/index.html` and line in `public/ads.txt`)
  - `slotA`: `""` (ad unit ID for Slot A, below the tool card)
  - `slotB`: `""` (ad unit ID for Slot B, above the footer)
- **Adsterra (`ADS.adsterra`):**
  - `bannerKey`: `""` (728×90 desktop banner key for Slot A)
  - `bannerKeyMobile`: `""` (300×250 or 320×50 mobile banner key for Slot A)
  - `mobileSize`: `"300x250"` (`"300x250"` or `"320x50"`)
  - `bannerHost`: `"//www.highperformanceformat.com"`
  - `nativeKey`: `""` and `nativeSrc`: `""` (Native Banner for Slot B)
  - `socialBar`: `false` and `socialBarSrc`: `""` (disabled by default)
- **Monetag (`ADS.monetag`):**
  - `zoneTag`: `""` (paste the `<script>…</script>` snippet for an In-Page Push or banner zone)

---

## 3. Tool Audio Parameters (`public/app.v2.js`)

| Constant | Value | Description |
|---|---|---|
| `TEST_MS` | `5000` (5 seconds) | Duration of the live RMS microphone level test. |
| `RECORD_MS` | `4000` (4 seconds) | Duration of the local in-memory `MediaRecorder` clip for playback. |
| `WORKING_PEAK` | `20` (out of 100) | Minimum peak level (~ −48 dBFS) required to classify the mic as `"working"` vs `"silent"`. |
| `DB_FLOOR` | `-60` dBFS | Decibel floor mapped to `0 / 100` (`0 dBFS` maps to `100 / 100`). |

### Custom GA4 Events Fired
- `test_started`
- `test_result` with parameter `{ result: "working" | "silent" | "blocked" | "no_device" | "busy" | "unsupported" }`
- `playback_clicked`

---

## 4. Firebase Hosting Configuration (`firebase.json` & `.firebaserc`)

- **Public directory:** `public`
- **URL formatting:** `"cleanUrls": true`, `"trailingSlash": false`
- **Security headers (all routes):**
  - `Permissions-Policy: microphone=(self), camera=(), geolocation=()`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Cache-Control policy:**
  - HTML pages (`/`, `/about`, `/privacy`, `/terms`, `/404.html`): `no-cache`
  - Runtime config & service worker (`/config.js`, `/sw.js`): `no-cache`
  - Versioned CSS & JS (`/styles.v1.css`, `/app.v2.js`): `public, max-age=31536000, immutable`
  - Icons & images (`*.png`, `*.svg`): `public, max-age=31536000, immutable`
  - Metadata files (`*.txt`, `*.xml`, `*.webmanifest`): `public, max-age=3600`

---

## 5. Helper Scripts

| Script | Command | Purpose |
|---|---|---|
| `scripts/set-site.mjs` | `node scripts/set-site.mjs --url <url> --email <email> --name "<name>"` | Updates the canonical URL, email, and owner name across all files in `public/` and saves current state in `scripts/site.json`. |
| `scripts/make-images.py` | `python scripts/make-images.py` | Regenerates `public/icon-192.png`, `public/icon-512.png`, and `public/og-image.png` using Pillow. |
| Local Emulator | `firebase emulators:start --only hosting --project demo-mic-check` | Serves the site locally at `http://localhost:5000`. |
| Production Deploy | `firebase deploy --only hosting` | Deploys `public/` to `https://mic-check-tool.web.app`. |
| Git Push | `git push` | Pushes committed changes on `main` to `https://github.com/okakoa/mic-check`. |

