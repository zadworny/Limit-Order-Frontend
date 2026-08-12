import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { pageForSlug, type DocPage } from "./navigation";

export interface DocFrontmatter {
  title: string;
  description: string;
  section: string;
  order: number;
}

export interface TocEntry {
  depth: 2 | 3;
  text: string;
  id: string;
}

export interface LoadedDoc {
  page: DocPage;
  frontmatter: DocFrontmatter;
  body: string;
  toc: TocEntry[];
}

/**
 * Docs pages cross-link with relative `.md` paths so the same source renders
 * correctly both here and when `content/docs` is published as a standalone
 * documentation space. Rewrite those into site routes at render time.
 */
export function rewriteDocLinks(body: string, file: string): string {
  const dir = path.posix.dirname(file);
  return body.replace(/\]\((\.\.?\/[^)\s#]*\.md)(#[^)\s]*)?\)/g, (match, href: string, hash = "") => {
    const target = path.posix.normalize(path.posix.join(dir, href)).replace(/\.md$/, "");
    const slug = target === "index" ? "" : target.replace(/\/index$/, "");
    const page = pageForSlug(slug);
    if (!page) return match;
    return `](${slug === "" ? "/docs" : `/docs/${slug}`}${hash})`;
  });
}

/** Mirrors rehype-slug (github-slugger) closely enough for our headings. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractToc(body: string): TocEntry[] {
  const toc: TocEntry[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = line.match(/^(##|###)\s+(.+?)\s*$/);
    if (!match) continue;
    const text = match[2].replace(/[`*_]/g, "");
    toc.push({ depth: match[1].length as 2 | 3, text, id: slugifyHeading(match[2]) });
  }
  return toc;
}

export async function loadDoc(slug: string): Promise<LoadedDoc | null> {
  const page = pageForSlug(slug);
  if (!page) return null;
  const filePath = path.join(process.cwd(), "content", "docs", `${page.file}.md`);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  const frontmatter: DocFrontmatter = {
    title: String(data.title ?? page.title),
    description: String(data.description ?? ""),
    section: String(data.section ?? page.section),
    order: Number(data.order ?? 0),
  };
  return { page, frontmatter, body: content, toc: extractToc(content) };
}
