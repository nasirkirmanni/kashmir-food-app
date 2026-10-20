import { llmsFullText } from "@/lib/journalFeed";

// Built once per deploy, like the posts themselves.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullText(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
