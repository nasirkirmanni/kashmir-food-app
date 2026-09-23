import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { kashmirifoodBlogs } from "@/data/kashmirifoodBlogs";
import JsonLd from "@/components/JsonLd";
import { buildArticleSchema, buildBreadcrumbSchema, buildFaqSchema } from "@/components/JsonLd";
import { faqsFromMarkdown } from "@/lib/markdownFaq";
import { toMetaDescription } from "@/lib/metaText";

// Strip duplicate leading title from markdown (the page already renders h1)
function stripLeadingTitle(markdown, title) {
  const normalise = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  return (markdown || "").replace(/^\s*#\s+([^\n]*)\n/, (line, heading) =>
    normalise(heading) === normalise(title) ? "" : line
  );
}

export function generateStaticParams() {
  return kashmirifoodBlogs.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = kashmirifoodBlogs.find((p) => p.slug === params.slug);
  if (!post) return {};
  const canonicalUrl = `https://wazwanway.com/kashmiri-food-blogs/${post.slug}`;
  return {
    title: post.seoTitle || post.title,
    description: toMetaDescription(post.metaDescription || post.excerpt),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: "Wazwan Way",
      images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default function KashmirifoodBlogArticle({ params }) {
  const post = kashmirifoodBlogs.find((p) => p.slug === params.slug);
  if (!post) notFound();

  // Build FAQ schema from markdown content
  const faqs = faqsFromMarkdown(post.content);

  // Related dishes — find matching posts
  const relatedPosts = (post.relatedDishes || [])
    .map((slug) => kashmirifoodBlogs.find((p) => p.slug === slug))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 flex flex-col items-center page-shell relative">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />

      <article className="w-full max-w-3xl relative z-10">
        {/* JSON-LD: Article */}
        <JsonLd
          data={buildArticleSchema({
            title: post.title,
            description: post.metaDescription || post.excerpt,
            author: post.author,
            datePublished: post.date,
            category: post.category,
            path: `/kashmiri-food-blogs/${post.slug}`,
            readTime: post.readTime,
            keywords: post.primaryKeyword,
          })}
        />

        {/* JSON-LD: Breadcrumbs */}
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: "Kashmiri Food Blogs", url: "https://wazwanway.com/kashmiri-food-blogs" },
            { name: post.title, url: `https://wazwanway.com/kashmiri-food-blogs/${post.slug}` },
          ])}
        />

        {/* JSON-LD: FAQPage (if FAQs exist) */}
        {faqs.length >= 2 && <JsonLd data={buildFaqSchema(faqs)} />}

        {/* Back link */}
        <Link
          href="/kashmiri-food-blogs"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Kashmiri Food Blogs
        </Link>

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.6rem] bg-[var(--saffron)]/10 px-3 py-1.5 rounded-full border border-[var(--saffron)]/20">
            {post.category}
          </span>
          {post.isWazwan && (
            <span className="text-amber-300/70 font-bold tracking-[0.12em] uppercase text-[0.55rem] bg-amber-300/5 px-2.5 py-1 rounded-full border border-amber-300/15">
              Wazwan Dish
            </span>
          )}
          <span className="flex items-center gap-1.5 text-white/50 text-[0.65rem] uppercase tracking-wider font-semibold">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-white mb-8 leading-[1.1] tracking-tight">
          {post.title}
        </h1>

        {/* Author / Date */}
        <div className="flex items-center gap-6 text-[0.65rem] uppercase tracking-wider font-bold text-white/55 mb-12 pb-8 border-b border-white/10">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--saffron)]" /> {post.author}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {post.date}
          </span>
        </div>

        {/* Article Body */}
        <div className="max-w-none text-white/70 leading-relaxed font-body pb-12 wazwan-article-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h2 className="font-display text-3xl sm:text-4xl text-[var(--saffron)] mt-14 mb-6" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="font-display text-2xl sm:text-3xl text-[var(--saffron)] mt-12 mb-6" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="font-display text-xl sm:text-2xl text-white mt-10 mb-4" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-6 text-sm sm:text-base md:text-lg leading-relaxed text-white/70" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-6 space-y-2 text-sm sm:text-base" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="marker:text-[var(--saffron)] text-white/75" {...props} />
              ),
              strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
              a: ({ node, ...props }) => (
                <a
                  className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4 font-semibold"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-[var(--saffron)] pl-6 italic my-8 text-white/60 text-lg sm:text-xl"
                  {...props}
                />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-8 rounded-xl border border-white/10">
                  <table className="w-full text-sm" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => <thead className="bg-white/5" {...props} />,
              th: ({ node, ...props }) => (
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--saffron)]" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-3 border-t border-white/5 text-white/65" {...props} />
              ),
            }}
          >
            {stripLeadingTitle(post.content, post.title)}
          </ReactMarkdown>
        </div>

        {/* Related Dishes */}
        {relatedPosts.length > 0 && (
          <aside className="border-t border-white/10 pt-10 pb-6">
            <h2 className="font-display text-2xl text-white mb-6">Related Kashmiri Dishes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/kashmiri-food-blogs/${related.slug}`}>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[var(--saffron)]/25 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[var(--saffron)] font-bold tracking-[0.1em] uppercase text-[0.5rem] bg-[var(--saffron)]/10 px-2 py-0.5 rounded-full border border-[var(--saffron)]/15">
                        {related.category}
                      </span>
                    </div>
                    <h3 className="font-display text-base text-white group-hover:text-[var(--saffron)] transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>
    </div>
  );
}
