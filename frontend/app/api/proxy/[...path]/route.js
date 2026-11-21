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
  process.env.BACKEND_URL || "https://kashmir-food-app-api.onrender.com";

export const runtime = "nodejs"; // Must be Node.js runtime, NOT edge
export const dynamic = "force-dynamic"; // MUST NOT BE CACHED, otherwise Set-Cookie headers are stripped from cached responses
// A Waza AI answer streams for as long as the model writes. The backend gives up after 50 seconds
// (WAZA_TOTAL_TIMEOUT_MS); the function must outlast that or a long answer is cut in the middle.
// 60 is the most every Vercel plan allows, with or without Fluid compute. If a stream is cut here
// all the same, the page asks the backend for the rest of the answer (hooks/useWazaChat.js).
export const maxDuration = 60;

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
      // When the visitor leaves or presses stop, the backend is told too, so a model is not left
      // writing an answer no one will read.
      signal: req.signal,
    });

    // Build the response headers, critically including Set-Cookie
    const responseHeaders = new Headers();

    // Copy all response headers from the backend
    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers, set-cookie (handled separately below),
      // and encoding headers (Node fetch already decompresses the body)
      if (
        lower === "transfer-encoding" ||
        lower === "connection" ||
        lower === "keep-alive" ||
        lower === "set-cookie" ||
        lower === "content-encoding" ||
        lower === "content-length"
      ) {
        return;
      }
      responseHeaders.append(key, value);
    });

    // Properly forward Set-Cookie headers without comma-merging them
    // (Node.js fetch merges Set-Cookies into one string by default, which Safari rejects)
    const setCookies = backendRes.headers.getSetCookie ? backendRes.headers.getSetCookie() : [];
    setCookies.forEach(cookie => {
      responseHeaders.append("Set-Cookie", cookie);
    });

    // Stream the response body back
    const responseBody = backendRes.body;

    return new Response(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    // The visitor went away before the backend answered: there is no one to send an error to.
    if (req.signal?.aborted) return new Response(null, { status: 499 });
    console.error("[API Proxy] Upstream error:", error.message);
    // The reason stays in the server log; the browser is told only that it failed.
    return new Response(
      JSON.stringify({ error: "Backend unavailable", message: "The service could not be reached. Please try again in a moment." }),
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
