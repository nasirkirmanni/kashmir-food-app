import { journalFeedXml } from "@/lib/journalFeed";

// Built once per deploy, like the posts themselves.
export const dynamic = "force-static";

export function GET() {
  return new Response(journalFeedXml(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
