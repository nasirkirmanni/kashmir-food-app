import { blogPosts } from "@/data/blogPosts";
import { CORE_SEVEN_SERIES } from "@/data/coreSevenSeries";
import { markdownSummary } from "@/lib/metaText";
import BlogIndexClient from "./BlogIndexClient";

// What a card needs, and nothing more: the full posts stay on the server.
function card(post) {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    readTime: post.readTime,
    author: post.author,
    date: post.date,
    excerpt: post.excerpt || post.summary || markdownSummary(post.content),
  };
}

export default function BlogPage() {
  const posts = blogPosts.map(card);
  const series = CORE_SEVEN_SERIES.map((story) => ({
    ...story,
    readTime: blogPosts.find((post) => post.slug === story.slug)?.readTime,
  }));
  return <BlogIndexClient posts={posts} series={series} />;
}
