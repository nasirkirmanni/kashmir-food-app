import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { blogPosts } from "@/data/blogPosts";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { buildArticleSchema } from "@/components/JsonLd";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return {};
  
  const canonicalUrl = `https://wazwanway.com/blog/${post.slug}`;
  
  return {
    title: post.title,
    description: post.excerpt || post.summary || `Read about ${post.title} on Wazwan Way.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: post.title,
      description: post.excerpt || post.summary || `Read about ${post.title} on Wazwan Way.`,
      images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: post.title }],
      siteName: "Wazwan Way",
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.summary || `Read about ${post.title} on Wazwan Way.`,
      images: ["/wazwan-hero.jpg"],
    },
  };
}

export default function BlogPostPage({ params }) {
  const { slug } = params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const canonicalUrl = `https://wazwanway.com/blog/${post.slug}`;
  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt || post.summary,
    image: "/wazwan-hero.jpg",
    author: post.author,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    category: post.category,
    path: `/blog/${post.slug}`,
    readTime: post.readTime,
  });

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 flex flex-col items-center page-shell">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <article className="w-full max-w-3xl relative z-10">
        <JsonLd data={articleSchema} />
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-sm uppercase tracking-wider font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>
        
        {/* Category & Metadata */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
          <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.65rem] bg-[var(--saffron)]/10 px-3 py-1.5 rounded-full border border-[var(--saffron)]/20">
            {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-white/50 text-[0.7rem] uppercase tracking-wider font-semibold">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-[1.1]">
          {post.title}
        </h1>
        
        {/* Author & Date */}
        <div className="flex items-center gap-6 text-[0.7rem] uppercase tracking-wider font-bold text-white/60 mb-12 pb-8 border-b border-white/10">
          <span className="flex items-center gap-2"><User className="w-4 h-4 text-[var(--saffron)]" /> {post.author}</span>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
        </div>
        
        {/* Content */}
        <div className="max-w-none text-white/70 leading-relaxed font-body pb-16">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="font-display text-4xl text-[var(--saffron)] mt-14 mb-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="font-display text-3xl text-[var(--saffron)] mt-12 mb-6" {...props} />,
              h3: ({node, ...props}) => <h3 className="font-display text-2xl text-white mt-10 mb-4" {...props} />,
              p: ({node, ...props}) => <p className="mb-6 text-lg" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg" {...props} />,
              li: ({node, ...props}) => <li className="marker:text-[var(--saffron)]" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
              a: ({node, ...props}) => <a className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--saffron)] pl-6 italic my-8 text-white/60 text-xl" {...props} />,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}