#!/usr/bin/env node
/**
 * Builds the local full-text search index for /docs into public/docs-search.json.
 * Records are one-per-heading-section so results deep-link to anchors.
 * No hosted search service is involved.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content", "docs");
const outFile = path.join(root, "public", "docs-search.json");

/** Docs pages only. README/SUMMARY are publishing scaffolding, not routes. */
const NON_PAGE_FILES = new Set(["README.md", "SUMMARY.md"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    if (NON_PAGE_FILES.has(entry.name)) return [];
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return [{}, raw];
  const data = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (kv) data[kv[1]] = kv[2];
  }
  return [data, raw.slice(match[0].length)];
}

function routeFor(file) {
  const rel = path.relative(contentDir, file).replace(/\.md$/, "");
  const slug = rel.endsWith("/index") ? rel.slice(0, -"/index".length) : rel === "index" ? "" : rel;
  return slug === "" ? "/docs" : `/docs/${slug}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function cleanText(lines) {
  return lines
    .join(" ")
    .replace(/<[^>]+>/g, " ")
    .replace(/```[a-z]*/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_\\|#>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const records = [];
for (const file of walk(contentDir)) {
  const [fm, body] = parseFrontmatter(readFileSync(file, "utf8"));
  const route = routeFor(file);
  const title = fm.title ?? route;
  const section = fm.section ?? "";

  let heading = "";
  let anchor = "";
  let buffer = [];
  let inFence = false;
  const flush = () => {
    const text = cleanText(buffer);
    if (text) records.push({ route, title, section, heading, anchor, text: text.slice(0, 1200) });
    buffer = [];
  };
  buffer.push(fm.description ?? "");
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      // keep code text searchable (event names, function names)
      continue;
    }
    const match = !inFence && line.match(/^(##|###)\s+(.+?)\s*$/);
    if (match) {
      flush();
      heading = match[2].replace(/[`*_]/g, "");
      anchor = slugify(match[2]);
    } else {
      buffer.push(line);
    }
  }
  flush();
}

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(records));
console.log(`docs search index: ${records.length} records -> public/docs-search.json`);
