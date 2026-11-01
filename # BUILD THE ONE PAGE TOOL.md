# BUILD THE ONE PAGE TOOL

## THE ONE JOB
Site name: Mic-Check (change if you like)
Domain: [YOUR-DOMAIN.com]  (until then, use the Firebase default: [project-id].web.app)
The one job: Check if this device's microphone is working, right now, in the browser.
Primary search phrase: "mic test" / "test my microphone" / "is my microphone working"

## 0. Ground rules (do not break these)
- ONE page, ONE box, ONE answer. No logins, no accounts, no settings, no menus, no hamburger, no cookie walls beyond the legally required consent banner.
- The whole tool fits in a single centered card: one big button → one plain-language result.
- Fast: no frameworks. Plain HTML + one small CSS file + one small vanilla JS file. No jQuery, no React, no web fonts (use the system font stack). Target: Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO on mobile.
- Works on phone, tablet, desktop: mobile-first CSS, fluid layout, tap targets ≥ 48px, no horizontal scroll at 320px width.
- EVERY fact, result, label, heading, and explanation is real, selectable HTML text. Never put text inside images, canvas, SVG text, or CSS pseudo-content. Visual meters are allowed only as decoration; the same information must also be written in text next to them.
- Directly under the H1, put exactly one plain sentence that says what the site is, who it is for, and what job it does:
  "MicCheck is a free online microphone test for anyone on a phone, tablet, or computer: press one button to see and hear whether your microphone is working."
- Accessible: semantic HTML, a single H1, labels, visible focus states, aria-live="polite" on the result box, color contrast AA, works with keyboard only, respects prefers-reduced-motion and prefers-color-scheme.

## 1. Tech stack and hosting (Google-only)
- Host on Firebase Hosting. Everything stays in the Google ecosystem.
- This tool needs NO backend: all audio processing happens in the browser and audio never leaves the device. Do not create Cloud Functions, Firestore, or Auth. (If a future tool needs a backend, use Cloud Functions for Firebase 2nd gen in the same project.)
- Create these files:
  /public/index.html
  /public/styles.css
  /public/app.js
  /public/privacy.html      (privacy policy, needed for AdSense and ad networks)
  /public/about.html        (who runs it, why, contact email)
  /public/terms.html
  /public/404.html
  /public/robots.txt
  /public/sitemap.xml
  /public/llms.txt
  /public/ads.txt
  /public/favicon.svg + /public/icon-192.png + /public/icon-512.png + /public/site.webmanifest
  /public/og-image.png (1200x630; the image is for social previews only and must not be the sole carrier of any fact)
  firebase.json, .firebaserc
- The legal pages are plain, minimal text pages that share the same CSS. They do not count as "menus": link them in a small footer only.
- firebase.json:
  - cleanUrls: true, trailingSlash: false
  - Headers on all HTML: 
    Permissions-Policy: microphone=(self)
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
  - Long cache (max-age=31536000, immutable) for .css/.js/.png/.svg with versioned filenames (e.g. app.v1.js); no-cache for .html.
  - Do NOT add a strict Content-Security-Policy yet. Ad networks load scripts from many domains and a strict CSP will break them. Leave a commented TODO.
- Give me the exact terminal commands: npm i -g firebase-tools, firebase login, firebase init hosting, firebase deploy. Also explain how to connect a custom domain in Firebase Console → Hosting → Add custom domain.

## 2. Page layout (top to bottom)
1. Header: site name as plain text (no logo image required).
2. H1: "Microphone Test: Check if Your Mic Is Working"
3. The one plain sentence (see Ground rules).
4. THE BOX (centered card):
   - One big button: "Test my microphone"
   - Result area (aria-live): starts with "Press the button. Your browser will ask for microphone permission."
   - After testing it shows ONE clear answer in large text, plus one short line of detail.
5. Ad slot A (below the box, never touching the button; at least 150px of spacing from the button so nobody clicks it by accident).
6. "How it works": 3 short numbered sentences in text.
7. "If your microphone is not working": short troubleshooting text organized by device (Windows, Mac, iPhone/iPad, Android, Chrome/Edge/Firefox/Safari permission resets). Plain text, not images.
8. FAQ: 6 to 8 real questions with direct 1 to 3 sentence answers (see section 5).
9. Ad slot B (optional, between FAQ and footer).
10. Footer: "Your audio never leaves your device." · About · Privacy · Terms · Contact email · © year.

## 3. Tool logic (app.js): microphone test
- Feature-detect navigator.mediaDevices.getUserMedia. If it's missing, the answer is: "Your browser can't access a microphone. Try the latest Chrome, Edge, Firefox, or Safari."
- On button press:
  1. Request audio: getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).
  2. Use the Web Audio API AnalyserNode to measure input level (RMS → 0 to 100) for ~5 seconds. Show a simple level bar (decorative) AND the live text "Input level: 37 / 100".
  3. Instruct in text: "Say something or clap now…"
  4. Simultaneously record ~4 seconds with MediaRecorder and then offer a "Play it back" button (inside the same box) so the user can hear themselves. If MediaRecorder isn't supported (older Safari), skip playback gracefully and say so in text.
  5. After permission is granted, call enumerateDevices() and show the active microphone's name in text: "Using: MacBook Pro Microphone". If there are several inputs, show a single small <select> to switch mic and retest. This is the only extra control allowed.
  6. Stop all tracks when done (release the mic; the browser's red recording dot must disappear).
- ONE answer, plain language, exactly one of:
  - ✅ "Yes: your microphone is working." (peak level above threshold)
  - ⚠️ "Your microphone is connected but we heard almost nothing. It may be muted, too quiet, or the wrong mic is selected."
  - ❌ "Microphone access was blocked." + one line on how to allow it for the user's detected browser.
  - ❌ "No microphone was found on this device."
  - ❌ "Your microphone is being used by another app. Close it and try again." (NotReadableError)
- Map every getUserMedia error name (NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError, SecurityError) to one of the answers above.
- Emoji are fine, but the meaning must also be in the words.
- No audio is uploaded, stored, or sent anywhere. Say so on the page.
- Fire GA4 events (see section 6): test_started, test_result {result: working|silent|blocked|no_device|busy|unsupported}, playback_clicked.

## 4. SEO
- <title>Mic Test – Check if Your Microphone Is Working (Free, Online)</title> (≤ 60 chars where possible)
- <meta name="description"> 140–160 chars, plain and direct.
- <link rel="canonical"> to the final domain.
- <html lang="en">, meta viewport, theme-color.
- Open Graph + Twitter card tags (title, description, og:image, og:url, og:type=website).
- One H1, logical H2s ("How it works", "Microphone not working?", "Frequently asked questions").
- robots.txt allows everything and points to the sitemap.
- sitemap.xml lists /, /about, /privacy, /terms with lastmod.
- All important content is in the initial HTML (not injected by JS) so crawlers and AI systems can read it without running scripts.
- Load all third-party scripts (analytics, ads) with async/defer AFTER the main content, so they never block the first paint or shift layout. Reserve fixed min-height for ad slots to prevent CLS.

## 5. GEO (Generative Engine Optimization: being quotable by AI answers)
- Write answers people (and AI assistants) can lift verbatim: short, factual, self-contained sentences.
- Add JSON-LD in index.html:
  - WebApplication (name, url, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", browserRequirements, offers price 0, description = the one plain sentence)
  - FAQPage containing the exact same Q&As visible on the page (must match the visible text word for word)
  - Organization or Person for the site owner (name, url, contact email)
- FAQ questions to answer:
  - How do I test my microphone online?
  - Why is my microphone not working?
  - How do I allow microphone access in Chrome / Safari / Firefox?
  - Is this microphone test safe? Is my audio recorded or uploaded?
  - Does it work on iPhone and Android?
  - Why does my mic work in other apps but not in the browser?
  - What does "input level" mean?
- llms.txt at the root: a plain-text summary of the site (what it does, who it's for, that it's free, that audio stays on-device), with links to the page and FAQ.
- robots.txt: explicitly allow common AI crawlers (GPTBot, Google-Extended, ClaudeBot, PerplexityBot) unless I say otherwise.
- Show a visible "Last updated: [date]" line in text on the page.

## 6. Google Analytics 4 + consent
- Add GA4 via gtag.js with Measurement ID placeholder: G-XXXXXXXXXX (put it in ONE config constant at the top of app.js or a small config.js so I only edit one place).
- Implement Google Consent Mode v2: default all ad_storage, ad_user_data, ad_personalization, analytics_storage to "denied" for EEA/UK/CH visitors, update on consent.
- Leave a clearly marked spot for a Google-certified CMP (Google's own "Privacy & messaging" consent message in AdSense is fine). Until then, show a minimal, non-blocking consent banner in text with Accept / Reject. No settings screens.
- Track the custom events listed in section 3.

## 7. AdSense-ready
- Add in <head> (commented out until I'm approved, but ready):
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
  and <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
- ads.txt contains a placeholder line: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
- Ad slot A and B are <div class="ad-slot" data-slot="A"> containers with reserved height, a tiny "Advertisement" text label, and no ads placed next to or overlapping the Test button, result text, or playback button.
- Make sure the site has the things AdSense reviewers look for: original helpful text content (the how-it-works, troubleshooting, and FAQ sections), About page with a real contact, Privacy policy that mentions cookies, Google Analytics, Google AdSense/third-party ad vendors, and how to opt out (link to Google Ads Settings), Terms page, working navigation via footer, no broken links, mobile friendly.

## 8. Adsterra / Monetag ad slots (switchable)
- Create one config object in config.js:
  const ADS = { provider: "none" | "adsense" | "adsterra" | "monetag", adsterra: { bannerKey: "", nativeKey: "", socialBarSrc: "" }, monetag: { zoneTag: "" } };
- The ad loader injects the right script into slots A/B based on provider, only after the page has loaded and after consent where required.
- Adsterra: support a 300x250 or 320x50 banner on mobile and 728x90 on desktop in slot A, and a Native Banner in slot B. Social Bar is optional and OFF by default.
- Monetag: support In-Page Push or a banner-style zone only. Popunder, Direct Link redirects, and Push Notifications (service worker) are OFF by default. If I enable Monetag push later, it needs a sw.js at the site root: add a commented placeholder and note it in the README.
- ads.txt: leave commented placeholders for whichever network I choose, with a note to paste the exact lines the network's dashboard gives me.
- Never let ads cover the box, auto-redirect, or delay the result.

## 9. Deliverables
- All files above, working locally (firebase emulators:start --only hosting or any static server; note that the microphone needs https or localhost).
- README.md with: deploy steps, where to paste GA4 ID / AdSense ID / Adsterra keys / Monetag tag, how to switch ad provider, how to add a custom domain, and a pre-launch checklist.
- Run Lighthouse (mobile) and fix anything under 95. Test in Chrome, Safari (iOS), Firefox, and Android Chrome, including permission-denied and no-mic cases.

--------------------------------------------------------------------------------------------------------------------------

Setting up the ads

I can’t open ad or AdSense accounts for you. Signing up requires your identity, your tax details and your payout method. The prompt does the code side: every ID goes into one config file, and you switch networks by changing one setting. Your part:

Deploy first, then apply. All of these networks need a live site to review.
Google Analytics: go to analytics.google.com, create a property and add a Web stream with your domain. Copy the G-… ID into the config.
AdSense: go to adsense.google.com, add your site and paste your ca-pub-… ID. Then uncomment the head script and fix the ads.txt line. Approval can take days to weeks. Be aware that AdSense often rejects tiny one-function sites as “low-value content.” That’s why the prompt adds real how-it-works, troubleshooting and FAQ text.
Adsterra: sign up as a Publisher, add your website and create units (Banner 300x250 or 728x90, Native Banner). Paste each unit’s key into the config and add their ads.txt line.
Monetag: sign up as a Publisher, add your site and complete the site-ownership check the dashboard gives you. Create an In-Page Push or banner zone and paste its tag into the config.

Pick one strategy, not all three at once. If you want AdSense, apply with the site clean (provider "none"), and while you’re applying or running AdSense, stick to Adsterra banner and native units. Popunders, redirects and push prompts (Monetag’s highest-paying formats) are a common reason sites get rejected or banned by AdSense. They also annoy visitors to a “one button, one answer” tool. A reasonable path is to start with Adsterra banners, apply to AdSense once you have some traffic, and switch over if you’re approved.