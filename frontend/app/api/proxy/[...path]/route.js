/**
 * Universal same-origin API proxy.
 *
 * WHY THIS EXISTS:
 * ─────────────────
 * Vercel "rewrites" operate at the edge/CDN layer and **strip Set-Cookie headers**
 * from upstream responses. This means any cookie the Express backend tries to set
 * (CSRF token, refresh token, access token) is silently dropped before it reaches
 * the browser.
 *
 * On desktop browsers this was masked because some browsers are more permissive
 * with third-party cookies. On iOS (Safari, CriOS, Brave — all WebKit-based),
 * Apple's Intelligent Tracking Prevention (ITP) aggressively blocks any cross-site
 * cookie, making the failure 100% reproducible.
 *
 * This API route runs as a **Vercel serverless function** (not an edge rewrite).
 * It manually proxies every request to the Express backend and **explicitly copies
 * all Set-Cookie headers** back to the browser. Because the browser sees the
 * response coming from wazwanway.com (same origin), all cookies are treated as
 * first-party and ITP does not interfere.
 *
 * ROUTE: /api/proxy/[...path]
 *   e.g. /api/proxy/auth/csrf-token  →  backend/api/auth/csrf-token
 *        /api/proxy/chat             →  backend/api/chat
 */

const BACKEND_URL =
  process.env.BACKEND_URL || "https://api.wazwanway.com";

export const runtime = "nodejs"; // Must be Node.js runtime, NOT edge

export async function handler(req, { params }) {
  const pathSegments = params.path || [];
  const backendPath = `/api/${pathSegments.join("/")}`;
  const url = new URL(backendPath, BACKEND_URL);

  // Forward query string
  const { searchParams } = new URL(req.url);
  searchParams.forEach((value, key) => url.searchParams.append(key, value));

  // Build headers to forward (skip host-level headers that would confuse the backend)
  const forwardHeaders = new Headers();
  const skipHeaders = new Set([
    "host",
    "connection",
    "transfer-encoding",
    "keep-alive",
    "upgrade",
  ]);

  req.headers.forEach((value, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  // Read body for non-GET/HEAD requests
  let body = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    // Check content type to decide how to read the body
    const contentType = req.headers.get("content-type") || "";
    if (
      contentType.includes("application/json") ||
      contentType.includes("text/")
    ) {
      body = await req.text();
    } else {
      body = await req.arrayBuffer();
    }
  }

  try {
    const backendRes = await fetch(url.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: "manual", // Don't follow redirects — let the browser handle them
    });

    // Build the response headers, critically including Set-Cookie
    const responseHeaders = new Headers();

    // Copy all response headers from the backend
    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers
      if (
        lower === "transfer-encoding" ||
        lower === "connection" ||
        lower === "keep-alive"
      ) {
        return;
      }
      responseHeaders.append(key, value);
    });

    // Stream the response body back
    const responseBody = backendRes.body;

    return new Response(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[API Proxy] Upstream error:", error.message);
    return new Response(
      JSON.stringify({ error: "Backend unavailable", details: error.message }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
