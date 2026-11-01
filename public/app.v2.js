/* MicCheck – microphone test, GA4 + Consent Mode v2, switchable ad loader.
   Plain vanilla JS. No audio ever leaves the device. */
(function () {
  "use strict";

  /* ---------- Settings ---------- */
  var TEST_MS = 5000;        // how long we measure the input level
  var RECORD_MS = 4000;      // how long the playback clip is
  var WORKING_PEAK = 20;     // peak level (0–100) needed to call the mic "working" (~ -48 dBFS)
  var DB_FLOOR = -60;        // dBFS that maps to level 0 (0 dBFS maps to 100)

  var cfg = {
    ga: (typeof GA4_ID === "string") ? GA4_ID : "",
    consent: (typeof CONSENT === "object" && CONSENT) ? CONSENT : { banner: "builtin", showTo: "eea" },
    ads: (typeof ADS === "object" && ADS) ? ADS : { provider: "none" }
  };

  /* ======================================================================
     1. Consent Mode v2 + GA4
     ====================================================================== */
  var CONSENT_KEY = "mc_consent"; // "granted" | "denied"
  var CONSENT_REGIONS = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
    "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH"];

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Region-specific default (Google resolves the visitor's region): denied in EEA/UK/CH.
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", region: CONSENT_REGIONS, wait_for_update: 500
  });
  // Everyone else: granted by default.
  gtag("consent", "default", {
    ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted",
    analytics_storage: "granted"
  });

  function storedConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function saveConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* private mode */ }
  }
  function applyConsent(v) {
    var s = v === "granted" ? "granted" : "denied";
    gtag("consent", "update", {
      ad_storage: s, ad_user_data: s, ad_personalization: s, analytics_storage: s
    });
  }

  // Best-effort client-side guess (time zone) – used only to decide whether to SHOW the
  // banner and whether non-Google ad networks may load before a choice is made.
  function looksLikeConsentRegion() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      return /^Europe\//.test(tz) ||
        /^(Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)|Arctic\/Longyearbyen)$/.test(tz);
    } catch (e) { return true; }
  }

  var inConsentRegion = looksLikeConsentRegion();
  var consentChoice = storedConsent();
  if (consentChoice) applyConsent(consentChoice);

  gtag("js", new Date());
  var gaEnabled = /^G-[A-Z0-9]+$/.test(cfg.ga) && cfg.ga !== "G-XXXXXXXXXX";
  if (gaEnabled) gtag("config", cfg.ga);

  function track(name, params) {
    if (gaEnabled) gtag("event", name, params || {});
  }

  function loadScript(src, attrs) {
    var s = document.createElement("script");
    s.async = true;
    s.src = src;
    if (attrs) for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
    return s;
  }

  /* ---------- Consent banner ---------- */
  var banner = document.getElementById("consent");
  function showBannerIfNeeded() {
    if (!banner || consentChoice || cfg.consent.banner === "none") return;
    if (cfg.consent.showTo !== "all" && !inConsentRegion) return;
    banner.hidden = false;
  }
  function choose(v) {
    consentChoice = v;
    saveConsent(v);
    applyConsent(v);
    if (banner) banner.hidden = true;
    loadAds(); // ads waiting on a decision may load now
  }
  if (banner) {
    document.getElementById("consent-accept").addEventListener("click", function () { choose("granted"); });
    document.getElementById("consent-reject").addEventListener("click", function () { choose("denied"); });
  }

  /* ======================================================================
     2. Ad loader (provider switch lives in config.js)
     ====================================================================== */
  var adsLoaded = false;

  function slot(name) { return document.querySelector('.ad-slot[data-slot="' + name + '"]'); }
  function fill(name) { var s = slot(name); return s ? s.querySelector(".ad-fill") : null; }
  function hideSlot(name) { var s = slot(name); if (s) s.classList.add("is-empty"); }

  // Inject an HTML snippet (e.g. a network's <script> tag) so its scripts actually run.
  function injectSnippet(target, html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    Array.prototype.slice.call(tmp.childNodes).forEach(function (node) {
      if (node.nodeName === "SCRIPT") {
        var s = document.createElement("script");
        Array.prototype.slice.call(node.attributes).forEach(function (a) { s.setAttribute(a.name, a.value); });
        s.text = node.text;
        target.appendChild(s);
      } else {
        target.appendChild(node);
      }
    });
  }

  // Adsterra banners use document.write, so each banner runs inside its own iframe.
  // The iframe is denied microphone/camera access.
  function adsterraBanner(target, key, w, h, host) {
    var f = document.createElement("iframe");
    f.title = "Advertisement";
    f.width = w; f.height = h;
    f.setAttribute("scrolling", "no");
    f.setAttribute("allow", "microphone 'none'; camera 'none'; geolocation 'none'");
    f.style.border = "0";
    f.style.maxWidth = "100%";
    f.srcdoc = "<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden}</style></head><body>" +
      "<script>atOptions={'key':'" + key + "','format':'iframe','height':" + h + ",'width':" + w + ",'params':{}};<\/script>" +
      "<script src=\"" + host + "/" + key + "/invoke.js\"><\/script></body></html>";
    target.appendChild(f);
  }

  function loadAdsense() {
    var a = cfg.ads.adsense || {};
    if (!a.client || /X{6,}/.test(a.client)) { hideSlot("A"); hideSlot("B"); return; }
    window.adsbygoogle = window.adsbygoogle || [];
    if (consentChoice === "denied") window.adsbygoogle.requestNonPersonalizedAds = 1;
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      loadScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(a.client),
        { crossorigin: "anonymous" });
    }
    [["A", a.slotA], ["B", a.slotB]].forEach(function (p) {
      var t = fill(p[0]);
      if (!t || !p[1]) { hideSlot(p[0]); return; }
      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", a.client);
      ins.setAttribute("data-ad-slot", p[1]);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      t.appendChild(ins);
      window.adsbygoogle.push({});
    });
  }

  function loadAdsterra() {
    var a = cfg.ads.adsterra || {};
    var host = a.bannerHost || "//www.highperformanceformat.com";
    var t = fill("A");
    var wide = t && t.clientWidth >= 728;
    if (t && wide && a.bannerKey) {
      adsterraBanner(t, a.bannerKey, 728, 90, host);
    } else if (t && (a.bannerKeyMobile || a.bannerKey)) {
      var small = a.mobileSize === "320x50";
      adsterraBanner(t, a.bannerKeyMobile || a.bannerKey, small ? 320 : 300, small ? 50 : 250, host);
    } else hideSlot("A");

    var b = fill("B");
    if (b && a.nativeKey && a.nativeSrc) {
      var c = document.createElement("div");
      c.id = "container-" + a.nativeKey;
      b.appendChild(c);
      loadScript(a.nativeSrc, { "data-cfasync": "false" });
    } else hideSlot("B");

    if (a.socialBar === true && a.socialBarSrc) loadScript(a.socialBarSrc);
  }

  function loadMonetag() {
    var m = cfg.ads.monetag || {};
    var t = fill("A");
    if (t && m.zoneTag && m.zoneTag.trim()) injectSnippet(t, m.zoneTag.trim());
    else hideSlot("A");
    hideSlot("B");
  }

  function loadAds() {
    var p = cfg.ads.provider;
    if (adsLoaded || !p || p === "none") return;
    var undecided = !consentChoice && inConsentRegion && cfg.consent.banner !== "none";
    if (p === "adsense") {
      // Google ads respect Consent Mode; still wait for a choice when our own banner is showing.
      if (undecided) return;
    } else {
      // Non-Google networks: in consent regions, only after the visitor accepts.
      if (inConsentRegion && consentChoice !== "granted") {
        if (consentChoice === "denied") { hideSlot("A"); hideSlot("B"); }
        return;
      }
    }
    adsLoaded = true;
    try {
      if (p === "adsense") loadAdsense();
      else if (p === "adsterra") loadAdsterra();
      else if (p === "monetag") loadMonetag();
    } catch (e) { /* never let ads break the tool */ }
  }

  /* ---------- Third parties load after the page, never blocking it ---------- */
  function afterLoad(fn) {
    var run = function () {
      if ("requestIdleCallback" in window) window.requestIdleCallback(fn, { timeout: 2500 });
      else setTimeout(fn, 1);
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  }
  afterLoad(function () {
    showBannerIfNeeded();
    if (gaEnabled) loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga));
    loadAds();
  });

  /* ======================================================================
     3. Microphone test
     ====================================================================== */
  var $ = function (id) { return document.getElementById(id); };
  var btn = $("test-btn"), answerEl = $("answer"), detailEl = $("detail");
  var meterWrap = $("meter-wrap"), meterBar = $("meter-bar"), levelText = $("level-text");
  var deviceName = $("device-name"), picker = $("device-picker"), select = $("device-select");
  var playback = $("playback"), playBtn = $("play-btn"), playNote = $("playback-note");

  var stream = null, audioCtx = null, rafId = 0, stopTimer = 0, recorder = null;
  var clipUrl = null, clipAudio = null, running = false;

  function setAnswer(text, kind, detail) {
    answerEl.className = "answer" + (kind ? " is-" + kind : "");
    answerEl.textContent = text;
    detailEl.textContent = detail || "";
  }

  function browserName() {
    var ua = navigator.userAgent;
    var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (/SamsungBrowser/.test(ua)) return "samsung";
    if (/Edg\//.test(ua)) return "edge";
    if (/Firefox|FxiOS/.test(ua)) return "firefox";
    if (ios && /CriOS/.test(ua)) return "ios-chrome";
    if (ios) return "ios-safari";
    if (/Chrome|Chromium|CriOS/.test(ua)) return /Android/.test(ua) ? "android-chrome" : "chrome";
    if (/Safari/.test(ua)) return "mac-safari";
    return "other";
  }

  function allowHint() {
    switch (browserName()) {
      case "chrome": return "In Chrome, click the icon to the left of the web address, set Microphone to Allow, then reload the page.";
      case "edge": return "In Edge, click the lock icon to the left of the web address, set Microphone to Allow, then reload the page.";
      case "android-chrome": return "In Chrome, tap the icon to the left of the web address, open Permissions, allow Microphone, then reload. Also check Android Settings > Apps > Chrome > Permissions.";
      case "samsung": return "In Samsung Internet, tap the icon to the left of the web address, allow Microphone, then reload. Also check Android Settings > Apps > Samsung Internet > Permissions.";
      case "firefox": return "In Firefox, click the permissions icon to the left of the web address, clear the blocked microphone permission, then reload and choose Allow.";
      case "ios-safari": return "On iPhone or iPad, tap the page menu in the address bar, then Website Settings > Microphone > Allow, and reload.";
      case "ios-chrome": return "On iPhone or iPad, open Settings > Chrome and turn on Microphone, then reload this page.";
      case "mac-safari": return "In Safari, open Safari > Settings > Websites > Microphone, set this website to Allow, then reload.";
      default: return "Open your browser's site settings, allow the microphone for this website, then reload the page.";
    }
  }

  function showResult(result) {
    switch (result) {
      case "working":
        setAnswer("✅ Yes: your microphone is working.", "ok", "We picked up sound clearly. Press \"Play it back\" to hear yourself."); break;
      case "silent":
        setAnswer("⚠️ Your microphone is connected but we heard almost nothing. It may be muted, too quiet, or the wrong mic is selected.", "warn",
          "Check the mute switch and input volume, or pick another microphone and test again."); break;
      case "blocked":
        setAnswer("❌ Microphone access was blocked.", "bad", allowHint()); break;
      case "no_device":
        setAnswer("❌ No microphone was found on this device.", "bad", "Plug in or connect a microphone or headset, then test again."); break;
      case "busy":
        setAnswer("❌ Your microphone is being used by another app. Close it and try again.", "bad",
          "Video-call and recording apps often hold the microphone. Closing them usually fixes this."); break;
      case "unsupported":
        setAnswer("❌ Your browser can't access a microphone. Try the latest Chrome, Edge, Firefox, or Safari.", "bad",
          window.isSecureContext === false ? "This page must be opened over https:// for microphone access." : ""); break;
    }
    track("test_result", { result: result });
  }

  function errorToResult(err) {
    var n = err && err.name;
    if (n === "NotAllowedError" || n === "PermissionDeniedError" || n === "SecurityError") return "blocked";
    if (n === "NotFoundError" || n === "DevicesNotFoundError" || n === "OverconstrainedError" || n === "ConstraintNotSatisfiedError") return "no_device";
    if (n === "NotReadableError" || n === "TrackStartError" || n === "AbortError") return "busy";
    if (n === "TypeError") return "unsupported";
    return "busy";
  }

  function releaseMic() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    clearTimeout(stopTimer);
    if (recorder && recorder.state !== "inactive") { try { recorder.stop(); } catch (e) {} }
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
    if (audioCtx && audioCtx.state !== "closed") { try { audioCtx.close(); } catch (e) {} }
    audioCtx = null;
  }

  function resetPlayback() {
    if (clipAudio) { clipAudio.pause(); clipAudio = null; }
    if (clipUrl) { URL.revokeObjectURL(clipUrl); clipUrl = null; }
    playback.hidden = true;
    playNote.hidden = true;
    playNote.textContent = "";
  }

  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return "";
    var types = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus", "audio/aac"];
    for (var i = 0; i < types.length; i++) if (MediaRecorder.isTypeSupported(types[i])) return types[i];
    return "";
  }

  function startRecording(s) {
    if (typeof window.MediaRecorder !== "function") {
      playNote.textContent = "Playback isn't available in this browser, but the level test still works.";
      playNote.hidden = false;
      return;
    }
    var chunks = [];
    try {
      var mime = pickMime();
      recorder = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
    } catch (e) {
      recorder = null;
      playNote.textContent = "Playback isn't available in this browser, but the level test still works.";
      playNote.hidden = false;
      return;
    }
    recorder.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = function () {
      if (!chunks.length) return;
      var blob = new Blob(chunks, { type: recorder && recorder.mimeType || chunks[0].type || "audio/webm" });
      clipUrl = URL.createObjectURL(blob);
      playback.hidden = false;
    };
    recorder.start();
    setTimeout(function () {
      if (recorder && recorder.state === "recording") { try { recorder.stop(); } catch (e) {} }
    }, RECORD_MS);
  }

  // Format raw browser/OS microphone labels into friendly, unambiguous names.
  // On desktop, strip the "Default - " / "Communications - " prefix on virtual aliases.
  // On Android Chrome, where the OS hides the phone's brand/model and reports audio routing
  // channels ("Default", "Speakerphone", "Communications", "Bluetooth headset", "Wired headset"),
  // turn bare labels into clear descriptions.
  function cleanMicLabel(raw, index, underlyingName) {
    var s = (raw || "").replace(/^\s*(Default|Communications)\s*[-–:]\s*/i, "").trim();
    if (!s || /^default$/i.test(s)) {
      return underlyingName ? ("Built-in microphone (" + underlyingName + ")") : "Built-in / Default microphone";
    }
    if (/^communications$/i.test(s)) {
      return "Phone-call microphone (Communications)";
    }
    if (/^speakerphone$/i.test(s)) {
      return "Speakerphone microphone";
    }
    return s || ("Microphone " + (index + 1));
  }

  function updateDevices(activeTrack) {
    if (!navigator.mediaDevices.enumerateDevices) return Promise.resolve();
    return navigator.mediaDevices.enumerateDevices().then(function (list) {
      var inputs = list.filter(function (d) { return d.kind === "audioinput"; });
      var settings = activeTrack && activeTrack.getSettings ? activeTrack.getSettings() : {};
      var activeId = settings.deviceId || "";
      var active = inputs.filter(function (d) { return d.deviceId === activeId; })[0];

      // Physical (non-alias) devices reported by the browser.
      var real = inputs.filter(function (d) {
        return d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications";
      });

      // Find the physical device that backs the "default" alias (only when it shares the same groupId).
      var defEntry = inputs.filter(function (d) { return d.deviceId === "default"; })[0];
      var backingDefault = defEntry && defEntry.groupId &&
        real.filter(function (d) { return d.groupId === defEntry.groupId; })[0];
      var backingName = backingDefault && backingDefault.label ? backingDefault.label.trim() : "";

      // Build the selectable list:
      // - On desktop (where "default" has the same groupId as a named physical mic), show each physical mic once.
      // - On Android (where "Default" is the primary handset mic and "Speakerphone" is a separate routing channel
      //   with its own groupId), include both in the list so the user can see and switch between them.
      var choices = [];
      var defaultSharesRealGroup = Boolean(backingDefault);
      if (defEntry && !defaultSharesRealGroup) {
        choices.push({
          deviceId: defEntry.deviceId,
          label: cleanMicLabel(defEntry.label, 0, "")
        });
      }
      real.forEach(function (d, i) {
        choices.push({
          deviceId: d.deviceId,
          label: cleanMicLabel(d.label, i, "")
        });
      });

      // Resolve the active microphone's display name and matching dropdown value.
      var rawActive = (active && active.label) || (activeTrack && activeTrack.label) || "";
      var activeBacking = "";
      if (active && (active.deviceId === "default" || /^default$/i.test(rawActive))) {
        var sameGroup = active.groupId && real.filter(function (d) { return d.groupId === active.groupId; })[0];
        activeBacking = (sameGroup && sameGroup.label) || backingName;
      }
      var displayLabel = cleanMicLabel(rawActive, 0, activeBacking);
      deviceName.textContent = "Using: " + displayLabel;
      deviceName.hidden = false;

      if (choices.length > 1) {
        var current = select.value || activeId;
        select.innerHTML = "";
        choices.forEach(function (c) {
          var o = document.createElement("option");
          o.value = c.deviceId;
          o.textContent = c.label;
          select.appendChild(o);
        });
        var match = choices.some(function (c) { return c.deviceId === current; });
        if (!match && active) {
          var same = real.filter(function (d) { return d.groupId === active.groupId; })[0];
          current = same ? same.deviceId : choices[0].deviceId;
        }
        select.value = choices.some(function (c) { return c.deviceId === current; }) ? current : choices[0].deviceId;
        picker.hidden = false;
      } else {
        picker.hidden = true;
      }
    }).catch(function () {});
  }

  function runTest() {
    if (running) return;
    track("test_started");

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      showResult("unsupported");
      return;
    }

    running = true;
    btn.disabled = true;
    btn.textContent = "Testing…";
    resetPlayback();
    setAnswer("Waiting for microphone permission…", "", "");

    var audio = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
    if (!picker.hidden && select.value) audio.deviceId = { exact: select.value };

    navigator.mediaDevices.getUserMedia({ audio: audio }).then(function (s) {
      stream = s;
      var track0 = s.getAudioTracks()[0];
      updateDevices(track0);

      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { releaseMic(); finish("unsupported"); return; }
      audioCtx = new AC();
      if (audioCtx.state === "suspended" && audioCtx.resume) audioCtx.resume();
      var src = audioCtx.createMediaStreamSource(s);
      var analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);
      var buf = new Uint8Array(analyser.fftSize);

      startRecording(s);

      setAnswer("Say something or clap now…", "", "Listening for 5 seconds.");
      meterWrap.hidden = false;

      var start = performance.now(), peak = 0, lastText = 0;
      var tick = function (now) {
        analyser.getByteTimeDomainData(buf);
        var sum = 0;
        for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
        var rms = Math.sqrt(sum / buf.length);
        var db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
        var level = Math.max(0, Math.min(100, Math.round((db - DB_FLOOR) / -DB_FLOOR * 100)));
        if (now - start > 250 && level > peak) peak = level; // skip the start-up click
        meterBar.style.transform = "scaleX(" + (level / 100) + ")";
        if (now - lastText > 120) {
          levelText.textContent = "Input level: " + level + " / 100";
          lastText = now;
        }
        if (now - start < TEST_MS) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      stopTimer = setTimeout(function () {
        releaseMic(); // stops tracks: the browser's recording indicator turns off
        meterBar.style.transform = "scaleX(0)";
        levelText.textContent = "Peak input level: " + peak + " / 100";
        finish(peak >= WORKING_PEAK ? "working" : "silent");
      }, TEST_MS);
    }).catch(function (err) {
      releaseMic();
      finish(errorToResult(err));
    });
  }

  function finish(result) {
    showResult(result);
    running = false;
    btn.disabled = false;
    btn.textContent = (result === "working" || result === "silent") ? "Test again" : "Test my microphone";
  }

  btn.addEventListener("click", runTest);

  playBtn.addEventListener("click", function () {
    if (!clipUrl) return;
    track("playback_clicked");
    if (clipAudio) clipAudio.pause();
    clipAudio = new Audio(clipUrl);
    playBtn.textContent = "Playing…";
    var done = function () { playBtn.textContent = "Play it back"; };
    clipAudio.onended = done;
    clipAudio.onerror = function () {
      done();
      playNote.textContent = "This browser couldn't play the recording.";
      playNote.hidden = false;
    };
    var p = clipAudio.play();
    if (p && p.catch) p.catch(done);
  });

  select.addEventListener("change", function () {
    btn.textContent = "Test this microphone";
  });

  // Always release the mic if the user leaves mid-test.
  window.addEventListener("pagehide", releaseMic);
})();
