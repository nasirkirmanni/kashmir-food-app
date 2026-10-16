import { Calendar, Clock, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts } from "@/data/blogPosts";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { buildArticleSchema, buildFaqSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedDishLinks from "@/components/RelatedDishLinks";
import StoryGlance from "@/components/blog/StoryGlance";
import StoryContents from "@/components/blog/StoryContents";
import SeriesNav, { SeriesBadge } from "@/components/blog/SeriesNav";
import { CORE_SEVEN_HUB, CORE_SEVEN_NAME, coreSevenStory } from "@/data/coreSevenSeries";
import { CORE_SEVEN_FACTS } from "@/data/coreSevenFacts";
import { isoDay } from "@/lib/contentDate";
import { markdownSummary, toMetaDescription } from "@/lib/metaText";
import { faqsFromMarkdown } from "@/lib/markdownFaq";
import { stripLeadingTitle } from "@/lib/markdownTitle";
import { countWords, headingId, nodeText, sectionHeadings, splitIntro } from "@/lib/storyStructure";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Shorter search titles for headlines that run past ~60 characters once the
// layout template adds " | Wazwan Way". The <h1>, og:title and twitter:title
// keep the full headline.
const SEARCH_TITLES = {
  "tabak-maaz-ribs-cooked-twice": "Tabak Maaz: Ribs Cooked Twice",
  "rista-pounded-meatballs": "Rista: The Meatball Pounded on Stone",
  "aab-gosht-milk-curry": "Aab Gosht: The Wazwan's Milk Curry",
  "daniwal-korma-coriander": "Daniwal Korma: The Coriander Course",
  "marchwangan-korma-chilli": "Marchwangan Korma: The Hottest Dish",
  "gushtaba-last-dish-of-wazwan": "Gushtaba: Why Wazwan Ends With a Meatball",
  "rogan-josh-history": "Rogan Josh History: Name, Origin and Colour",
  "what-is-ver-masala": "What Is Ver Masala? Wazwan's Secret Spice",
  "pampore-kashmiri-saffron": "Why Pampore Grows the World's Finest Saffron",
  "kashmiri-red-chili": "Kashmiri Red Chili: Wazwan's Iconic Color",
  "nadru-lotus-stem-kashmir": "Nadru (Lotus Stem): Kashmir's Beloved Vegetable",
  "fennel-and-dry-ginger-wazwan": "Fennel & Dry Ginger: The Flavor Base of Wazwan",
  "noon-chai-pink-tea-kashmir": "Noon Chai: The Science and Ritual of Pink Tea",
  "what-to-eat-in-kashmir": "What to Eat in Kashmir: A First-Timer's Guide",
  "kashmiri-street-food-srinagar": "Kashmiri Street Food: What to Eat in Srinagar",
  "kashmiri-winter-food": "Kashmiri Winter Food: Harissa & Hokh Syun",
  "kashmiri-cuisine-explained": "Kashmiri Cuisine: Dishes, Spices and History",
  "kashmiri-breakfast": "Kashmiri Breakfast: Noon Chai & Kandur Breads",
  "is-kashmiri-food-spicy": "Is Kashmiri Food Spicy? Colour vs Heat",
  "vegetarian-food-in-kashmir": "Vegetarian Food in Kashmir: What to Eat",
  "kashmiri-pandit-food": "Kashmiri Pandit Food: Dishes and Customs",
  "what-to-buy-in-kashmir-food-souvenirs": "What to Buy in Kashmir: Saffron, Walnuts & More",
  "kashmiri-sweets-desserts": "Kashmiri Sweets and Desserts: What to Try",
  "kashmiri-food-sources": "Kashmiri Food and Wazwan: Sources to Read",
};

// Tables with three or more columns get a minimum width, so on phones they
// scroll sideways inside their wrapper instead of squeezing every column.
function tableMinWidth(node) {
  const headerRow = node?.children
    ?.find((child) => child.tagName === "thead")
    ?.children?.find((child) => child.tagName === "tr");
  const columns = headerRow?.children?.filter((cell) => cell.tagName === "th").length || 0;
  return columns > 2 ? `${columns * 9}rem` : undefined;
}

// Posts with at least this many sections get a folded "In this story" list of them.
const CONTENTS_MIN_SECTIONS = 6;
const SITE_IMAGE = "/wazwan-hero.jpg";

// The markdown's elements, styled. Each <h2> carries the anchor the contents list links to.
const markdownComponents = {
  // The page title is the only <h1>; a top-level heading in the markdown becomes a section heading.
  h1: ({node, ...props}) => <h2 id={headingId(nodeText(node))} className="scroll-mt-28 font-display text-4xl text-[var(--saffron)] mt-14 mb-6" {...props} />,
  h2: ({node, ...props}) => <h2 id={headingId(nodeText(node))} className="scroll-mt-28 font-display text-3xl text-[var(--saffron)] mt-12 mb-6" {...props} />,
  h3: ({node, ...props}) => <h3 className="font-display text-2xl text-white mt-10 mb-4" {...props} />,
  p: ({node, ...props}) => <p className="mb-6 text-lg" {...props} />,
  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg" {...props} />,
  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg" {...props} />,
  li: ({node, ...props}) => <li className="marker:text-[var(--saffron)]" {...props} />,
  strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
  a: ({node, ...props}) => <a className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4" {...props} />,
  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--saffron)] pl-6 italic my-8 text-white/60 text-xl" {...props} />,
  table: ({node, ...props}) => (
    <div className="my-8 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full border-collapse text-left text-base" style={{ minWidth: tableMinWidth(node) }} {...props} />
    </div>
  ),
  thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
  th: ({node, ...props}) => <th className="px-4 py-3 align-top font-semibold text-white border-b border-white/10" {...props} />,
  td: ({node, ...props}) => <td className="px-4 py-3 align-top border-b border-white/5" {...props} />,
};

function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[[remarkGfm, { singleTilde: false }]]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  );
}

export function generateMetadata({ params }) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return {};
  
  const canonicalUrl = `https://wazwanway.com/blog/${post.slug}`;
  // The post's own summary, or its opening paragraph — never a generic sentence.
  const description = toMetaDescription(post.excerpt || post.summary || markdownSummary(post.content) || `Read about ${post.title} on Wazwan Way.`);
  // A story with its own photograph shares that; every other post shares the site image.
  const photo = CORE_SEVEN_FACTS[post.slug]?.photo;
  const image = photo
    ? { url: photo.src, width: photo.width, height: photo.height, alt: photo.alt }
    : { url: SITE_IMAGE, width: 1024, height: 1024, alt: post.title };
  const publishedTime = isoDay(post.date);
  const modifiedTime = isoDay(post.updatedDate);

  return {
    title: SEARCH_TITLES[post.slug] || post.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: post.title,
      description,
      images: [image],
      siteName: "Wazwan Way",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      authors: [post.author],
      section: post.category,
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image.url],
    },
  };
}

export default function BlogPostPage({ params }) {
  const { slug } = params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const story = coreSevenStory(post.slug);
  const facts = story ? CORE_SEVEN_FACTS[post.slug] : undefined;
  const content = stripLeadingTitle(post.content, post.title);
  const { intro, rest } = splitIntro(content);

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt || post.summary,
    image: facts?.photo ? [facts.photo.src, SITE_IMAGE] : SITE_IMAGE,
    author: post.author,
    datePublished: post.date,
    dateModified: post.updatedDate || post.date,
    category: post.category,
    path: `/blog/${post.slug}`,
    readTime: post.readTime,
    wordCount: countWords(content),
    ...(facts && {
      about: facts.about,
      mentions: facts.mentions,
      isPartOf: {
        "@type": "CreativeWorkSeries",
        name: "The Core Seven",
        url: `https://wazwanway.com${CORE_SEVEN_HUB}`,
      },
      position: story.number,
    }),
  });
  // A post's visible FAQ section doubles as FAQPage structured data.
  const faqs = faqsFromMarkdown(post.content);

  // The breadcrumb names the page by its short title; a core-seven story sits under the series.
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Journal", href: "/blog" },
    ...(story ? [{ name: CORE_SEVEN_NAME, href: CORE_SEVEN_HUB }] : []),
    { name: story ? story.name : SEARCH_TITLES[post.slug] || post.title, href: `/blog/${post.slug}` },
  ];

  const headings = [
    ...(facts ? [{ text: `${story.name} at a glance`, id: "at-a-glance" }] : []),
    ...sectionHeadings(rest),
  ];
  const showContents = headings.length >= CONTENTS_MIN_SECTIONS;

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 flex flex-col items-center page-shell">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <article className="w-full max-w-3xl relative z-10">
        <JsonLd data={articleSchema} />
        {faqs.length > 0 && <JsonLd data={buildFaqSchema(faqs)} />}
        <div className="mb-10">
          <Breadcrumbs items={crumbs} />
        </div>
        
        {/* Category & Metadata */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
          <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.65rem] bg-[var(--saffron)]/10 px-3 py-1.5 rounded-full border border-[var(--saffron)]/20">
            {post.category}
          </span>
          <SeriesBadge story={story} />
          <span className="flex items-center gap-1.5 text-white/50 text-[0.7rem] uppercase tracking-wider font-semibold">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-8 leading-[1.1]">
          {post.title}
        </h1>
        
        {/* Author & Date */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-wider font-bold text-white/60 mb-12 pb-8 border-b border-white/10">
          <span className="flex items-center gap-2"><User className="w-4 h-4 text-[var(--saffron)]" /> {post.author}</span>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
          {post.updatedDate ? <span>Updated {post.updatedDate}</span> : null}
        </div>
        
        {/* Content: the opening, then the fact box and the contents, then the sections */}
        <div className="max-w-none text-white/70 leading-relaxed font-body pb-16">
          {intro.trim() ? <Markdown>{intro}</Markdown> : null}
          {facts ? <StoryGlance name={story.name} facts={facts} /> : null}
          {showContents ? <StoryContents headings={headings} /> : null}
          {rest.trim() ? <Markdown>{rest}</Markdown> : null}
        </div>
        <SeriesNav story={story} />
        <RelatedDishLinks articlePath={`/blog/${post.slug}`} />
      </article>
    </div>
  );
}
