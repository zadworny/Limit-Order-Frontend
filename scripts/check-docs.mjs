#!/usr/bin/env node
/**
 * Docs integrity gate (runs in prebuild). Fails the build on navigation/content
 * drift, broken internal links, malformed frontmatter, unclosed code fences,
 * banned branding terms, or missing canonical deployment addresses.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content", "docs");
const failures = [];

// --- navigation source of truth, parsed from navigation.ts ---
const navSource = readFileSync(path.join(root, "src", "docs", "navigation.ts"), "utf8");
const navEntries = [...navSource.matchAll(/page\(\s*"((?:[^"\\]|\\.)*)",\s*"([^"]*)",\s*"([^"]+)",\s*"([^"]+)",?\s*\)/g)].map(
  (m) => ({ title: m[1], slug: m[2], file: m[3], section: m[4] }),
);
if (navEntries.length !== 36) {
  failures.push(`navigation.ts: expected 36 page() entries (35 section pages + home), found ${navEntries.length}`);
}

const routes = new Set(navEntries.map((e) => (e.slug === "" ? "/docs" : `/docs/${e.slug}`)));
const slugs = navEntries.map((e) => e.slug);
if (new Set(slugs).size !== slugs.length) failures.push("navigation.ts: duplicate slugs");
const files = navEntries.map((e) => e.file);
if (new Set(files).size !== files.length) failures.push("navigation.ts: duplicate files");

// --- nav <-> content parity ---
for (const entry of navEntries) {
  if (!existsSync(path.join(contentDir, `${entry.file}.md`))) {
    failures.push(`navigation entry without content file: ${entry.file}.md`);
  }
}

/** Publishing scaffolding rather than routed pages; exempt from nav parity and frontmatter. */
const NON_PAGE_FILES = new Set(["README.md", "SUMMARY.md"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (NON_PAGE_FILES.has(entry.name)) return [];
    return entry.name.endsWith(".md") ? [full] : [];
  });
}
const docFiles = walk(contentDir);
for (const file of docFiles) {
  const rel = path.relative(contentDir, file).replace(/\.md$/, "");
  if (!files.includes(rel)) failures.push(`content file missing from navigation: ${rel}.md`);
}

// --- per-file content checks ---
const titles = new Map();
// Delivery evidence for the live EVM implementation of the same settlement
// design. These are Avalanche C-Chain addresses and must appear only on the
// traction page, never where a reader could mistake them for a Stellar
// deployment — Seltra has no Stellar addresses yet.
const canonicalAddresses = [
  "0xbBdbb1785dB447CB04f7B2E0549b630eA7295d57",
  "0x6e97Ec1E64cB059F30De68a87f383a0C8F8670d3",
  "0x5fbbb45aC3BEDe19069decAa8012376064eC8351",
  "0xC4952bD555f979993b7BAB800d933dC2F082836d",
  "0xf7CeB84F59BF04D65801A479f4C91E217F451AA3",
  "0x2E5F8ba983dbCE1AAF396a8F6E023e9482ce9359",
];

for (const file of docFiles) {
  const rel = path.relative(contentDir, file);
  const raw = readFileSync(file, "utf8");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) {
    failures.push(`${rel}: missing frontmatter`);
    continue;
  }
  const title = fm[1].match(/^title:\s*"(.+)"\s*$/m)?.[1];
  if (!title) failures.push(`${rel}: missing frontmatter title`);
  else if (titles.has(title)) failures.push(`${rel}: duplicate title "${title}" (also in ${titles.get(title)})`);
  else titles.set(title, rel);
  for (const key of ["description", "section", "order"]) {
    if (!new RegExp(`^${key}:`, "m").test(fm[1])) failures.push(`${rel}: missing frontmatter ${key}`);
  }

  const fenceCount = (raw.match(/^\s*```/gm) ?? []).length;
  if (fenceCount % 2 !== 0) failures.push(`${rel}: unclosed fenced code block`);

  // Pages cross-link with relative .md paths so the same source works both on
  // the site and when content/docs is published as a standalone space. Site
  // routes are produced at render time, so an absolute /docs link is drift.
  for (const link of raw.matchAll(/\]\((\/docs[^)#\s]*)/g)) {
    failures.push(`${rel}: absolute site link ${link[1]} — use a relative .md path instead`);
  }
  for (const link of raw.matchAll(/\]\((\.\.?\/[^)\s#]*\.md)/g)) {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), link[1]));
    if (!existsSync(path.join(contentDir, target))) {
      failures.push(`${rel}: broken relative link ${link[1]}`);
      continue;
    }
    const slug = target.replace(/\.md$/, "").replace(/(^|\/)index$/, "");
    const route = slug === "" ? "/docs" : `/docs/${slug}`;
    if (!routes.has(route)) failures.push(`${rel}: link ${link[1]} resolves outside the navigation`);
  }

  if (rel === "traction.md") {
    for (const address of canonicalAddresses) {
      if (!raw.includes(address)) failures.push(`${rel}: missing canonical address ${address}`);
    }
  } else {
    for (const address of canonicalAddresses) {
      if (raw.includes(address)) {
        failures.push(`${rel}: EVM delivery-evidence address ${address} belongs only on traction.md`);
      }
    }
  }
}

// --- banned terms and internal references across the public implementation ---
const bannedDirs = ["app/docs", "src/components/docs", "src/docs", "content/docs", "public/brand"];
const bannedTerms = [/peridot/i, /gitbook/i];
const internalRefs = [/mainnet-readiness-plan/, /contracts-session-brief/, /deploy-digitalocean/, /docs\/screenshots/];
for (const dir of bannedDirs) {
  const full = path.join(root, dir);
  if (!existsSync(full)) continue;
  const all = readdirSync(full, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
  for (const file of all) {
    if (/\.(png|webp|ico|jpg)$/.test(file)) continue;
    const raw = readFileSync(file, "utf8");
    for (const term of bannedTerms) {
      if (term.test(raw)) failures.push(`${path.relative(root, file)}: banned public-brand term ${term}`);
    }
    for (const ref of internalRefs) {
      if (ref.test(raw)) failures.push(`${path.relative(root, file)}: unexpected internal file reference ${ref}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`docs:check FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(`docs:check passed: ${navEntries.length} routes, ${docFiles.length} content files, links/frontmatter/fences/brand clean`);
