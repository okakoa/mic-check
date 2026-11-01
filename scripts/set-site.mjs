// Replaces the placeholder site URL, contact email, and owner name across /public.
// Usage:
//   node scripts/set-site.mjs --url https://micchecktool.com --email hello@micchecktool.com --name "Jane Doe"
// Any flag can be omitted. Safe to re-run: it remembers the current values in scripts/site.json.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, "..", "public");
const stateFile = join(here, "site.json");
const state = existsSync(stateFile)
  ? JSON.parse(readFileSync(stateFile, "utf8"))
  : { url: "https://mic-check.web.app", email: "hello@YOUR-DOMAIN.com", name: "YOUR NAME" };

const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : undefined; };
const next = { url: get("url"), email: get("email"), name: get("name") };
if (next.url) next.url = next.url.replace(/\/+$/, "");
if (!next.url && !next.email && !next.name) {
  console.log("Nothing to do. Pass --url, --email and/or --name.");
  process.exit(0);
}

const exts = /\.(html|txt|xml|webmanifest|js)$/;
let changed = 0;
for (const f of readdirSync(pub).filter((f) => exts.test(f))) {
  const p = join(pub, f);
  let s = readFileSync(p, "utf8");
  const before = s;
  for (const k of ["url", "email", "name"]) {
    if (next[k] && next[k] !== state[k]) s = s.split(state[k]).join(next[k]);
  }
  if (s !== before) { writeFileSync(p, s); changed++; console.log("updated", f); }
}
for (const k of ["url", "email", "name"]) if (next[k]) state[k] = next[k];
writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
console.log(`Done. ${changed} file(s) changed.`);

