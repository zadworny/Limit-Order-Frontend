import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Callout } from "@/components/docs/callout";
import { Card, CardGrid } from "@/components/docs/card-grid";
import { CodePre } from "@/components/docs/code-block";
import { ContractAddress } from "@/components/docs/contract-address";
import { DocsPagination } from "@/components/docs/docs-pagination";
import { DocsToc } from "@/components/docs/docs-toc";
import { MermaidDiagram } from "@/components/docs/mermaid-diagram";
import { loadDoc, rewriteDocLinks } from "@/docs/content";
import { routeForSlug } from "@/docs/navigation";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function slugFromParams(params: { slug?: string[] }): string {
  return (params.slug ?? []).join("/");
}

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const doc = await loadDoc(slugFromParams(params));
  if (!doc) return {};
  const canonical = `${appUrl}${routeForSlug(doc.page.slug)}`;
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    alternates: { canonical },
    openGraph: {
      title: `${doc.frontmatter.title} — Seltra Docs`,
      description: doc.frontmatter.description,
      url: canonical,
      siteName: "Seltra",
      type: "article",
    },
  };
}

/**
 * Mermaid fences become client-rendered diagrams; everything else flows
 * through the MDX pipeline (rehype-pretty-code would otherwise try to
 * syntax-highlight the diagram source).
 */
function liftMermaid(body: string): string {
  return body.replace(/```mermaid\n([\s\S]*?)```/g, (_match, chart: string) => {
    const escaped = (chart as string).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    return `<MermaidDiagram chart={\`${escaped}\`} />`;
  });
}

const mdxComponents = {
  Callout,
  CardGrid,
  Card,
  ContractAddress,
  MermaidDiagram,
  pre: CodePre,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const href = props.href ?? "";
    if (href.startsWith("http")) {
      return <a {...props} className="docs-external" target="_blank" rel="noreferrer" />;
    }
    return <a {...props} />;
  },
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="docs-table-wrap">
      <table {...props} />
    </div>
  ),
};

export default async function DocPage({ params }: { params: { slug?: string[] } }) {
  const doc = await loadDoc(slugFromParams(params));
  if (!doc) notFound();

  const nonce = headers().get("x-nonce") ?? undefined;
  const canonical = `${appUrl}${routeForSlug(doc.page.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.frontmatter.title,
    description: doc.frontmatter.description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "Seltra", url: appUrl },
    about: "Seltra — programmable order execution on Soroban",
  };

  return (
    <div className="docs-page">
      <article className="docs-article">
        <p className="docs-crumb">{doc.frontmatter.section}</p>
        <h1>{doc.frontmatter.title}</h1>
        {doc.frontmatter.description ? <p className="docs-lede">{doc.frontmatter.description}</p> : null}
        <MDXRemote
          source={liftMermaid(rewriteDocLinks(doc.body, doc.page.file))}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "wrap" }],
                [
                  rehypePrettyCode,
                  {
                    theme: { light: "github-light", dark: "github-dark" },
                    keepBackground: false,
                  },
                ],
              ],
            },
          }}
        />
        <DocsPagination current={doc.page} />
      </article>
      <DocsToc toc={doc.toc} />
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
