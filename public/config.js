/* ==========================================================================
   MicCheck – site configuration. THIS IS THE ONLY FILE YOU NEED TO EDIT
   for analytics and ads. (Served with a short cache, so edits go live fast.)
   ========================================================================== */

/* Google Analytics 4 Measurement ID. Leave as "G-XXXXXXXXXX" to disable GA. */
var GA4_ID = "G-JXDQL7L7HZ";

/* Consent banner.
   banner: "builtin" = show the small Accept/Reject banner.
           "none"    = hide it (use this once Google's certified CMP from
                       AdSense "Privacy & messaging" is live).
   showTo: "eea" = only show to visitors whose time zone looks like EEA/UK/CH
                   (Consent Mode still defaults to "denied" for those regions).
           "all" = show to everyone. */
var CONSENT = { banner: "builtin", showTo: "eea" };

/* Ads. Pick ONE provider: "none" | "adsense" | "adsterra" | "monetag". */
var ADS = {
  provider: "adsterra",

  adsense: {
    client: "ca-pub-XXXXXXXXXXXXXXXX", // your publisher ID
    slotA: "",                          // ad unit ID (data-ad-slot) for slot A
    slotB: ""                           // ad unit ID for slot B (leave "" to skip)
  },

  adsterra: {
    bannerKey: "41babd7863c94b1ed41ce8a9853d5cbb",        // Banner 728x90 key (desktop, slot A)
    bannerSrc: "https://bauval.org/22/41babd7863c94b1ed41ce8a9853d5cbb",
    bannerKeyMobile: "240391e5747da4f99cef9682761d42a3",  // Banner 300x250 key (mobile, slot A)
    bannerSrcMobile: "https://bauval.org/22/240391e5747da4f99cef9682761d42a3",
    mobileSize: "300x250",// "300x250" or "320x50" – must match the mobile unit you created
    bannerHost: "https://bauval.org/22", // host/path prefix from your banner code
    nativeKey: "230eba95f0712e7ae4ebdf2f75645782",        // Native Banner key (slot B)
    nativeSrc: "https://bauval.org/21/230eba95f0712e7ae4ebdf2f75645782",
    socialBar: false,     // Social Bar is OFF by default
    socialBarSrc: ""      // full script URL from your Social Bar code
  },

  monetag: {
    /* Paste the In-Page Push OR banner zone tag exactly as Monetag gives it
       (the whole <script>…</script> snippet), between the backticks.
       Popunder, Direct Link and Push Notifications are intentionally NOT supported here.
       (Push would also need /sw.js – see README.) */
    zoneTag: ``
  }
};

/* Do not edit below: marks the active provider on <html> before first paint,
   so ad slots reserve their space immediately (no layout shift). */
document.documentElement.setAttribute("data-ads", ADS.provider || "none");

