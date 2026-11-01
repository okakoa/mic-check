/* ==========================================================================
   MicCheck – site configuration. THIS IS THE ONLY FILE YOU NEED TO EDIT
   for analytics and ads. (Served with a short cache, so edits go live fast.)
   ========================================================================== */

/* Google Analytics 4 Measurement ID. Leave as "G-XXXXXXXXXX" to disable GA. */
var GA4_ID = "G-XXXXXXXXXX";

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
  provider: "none",

  adsense: {
    client: "ca-pub-XXXXXXXXXXXXXXXX", // your publisher ID
    slotA: "",                          // ad unit ID (data-ad-slot) for slot A
    slotB: ""                           // ad unit ID for slot B (leave "" to skip)
  },

  adsterra: {
    bannerKey: "",        // Banner 728x90 key (desktop, slot A)
    bannerKeyMobile: "",  // Banner 300x250 or 320x50 key (mobile, slot A). Falls back to bannerKey.
    mobileSize: "300x250",// "300x250" or "320x50" – must match the mobile unit you created
    bannerHost: "//www.highperformanceformat.com", // host from your banner code (…/KEY/invoke.js)
    nativeKey: "",        // Native Banner key (slot B)
    nativeSrc: "",        // full invoke.js URL from your Native Banner code, e.g. "//pl123.example.com/KEY/invoke.js"
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

