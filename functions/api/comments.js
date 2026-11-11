// Reader comments for a story.
//   GET  /api/comments?story=/section/slug/  lists the approved comments
//   POST /api/comments                       sends a new comment for review
// New comments are saved as "pending" and stay hidden until approved.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const STORY = /^\/(?!page\/|admin\/|api\/|og\/|assets\/)[a-z0-9-]+\/[a-z0-9-]+\/$/;
const MAX_NAME = 40;
const MAX_BODY = 2000;
const MAX_PER_HOUR = 5;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// Trim, drop control characters and squeeze long runs of blank lines
const clean = (value) =>
  String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

async function sha256(text) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ request, env }) {
  const story = new URL(request.url).searchParams.get("story") || "";
  if (!STORY.test(story)) return json({ error: "Unknown story." }, 400);
  const { results } = await env.DB.prepare(
    "SELECT id, name, body, created_at FROM comments WHERE story = ?1 AND status = 'approved' ORDER BY created_at ASC LIMIT 500"
  )
    .bind(story)
    .all();
  return json({ comments: results });
}

export async function onRequestPost({ request, env }) {
  if (!env.TURNSTILE_SECRET) return json({ error: "Comments are not switched on yet." }, 503);

  // Only accept comments sent from our own pages
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ error: "Not allowed." }, 403);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Could not read the comment." }, 400);
  }

  // Hidden field that people never see. Only spam robots fill it in.
  if (data.website) return json({ ok: true });

  const story = String(data.story || "");
  const name = clean(data.name).replace(/\s+/g, " ");
  const body = clean(data.body);

  if (!STORY.test(story)) return json({ error: "Unknown story." }, 400);
  if (!name || name.length > MAX_NAME) return json({ error: `Please enter a name of up to ${MAX_NAME} characters.` }, 400);
  if (body.length < 2 || body.length > MAX_BODY) return json({ error: `Please write a comment of up to ${MAX_BODY} characters.` }, 400);

  // The story has to be a real page on the site
  const page = await env.ASSETS.fetch(new URL(story, request.url));
  if (!page.ok) return json({ error: "Unknown story." }, 400);

  // Spam check (Cloudflare Turnstile)
  const ip = request.headers.get("cf-connecting-ip") || "";
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", String(data.token || ""));
  if (ip) form.append("remoteip", ip);
  const check = await fetch(env.TURNSTILE_VERIFY_URL || VERIFY_URL, { method: "POST", body: form });
  const verdict = await check.json().catch(() => ({}));
  if (!verdict.success) return json({ error: "The spam check did not pass. Please try again." }, 403);

  // We keep a scrambled code in place of the address the comment came from.
  // It lets us limit floods without storing who the reader is.
  const sender = await sha256(`${env.TURNSTILE_SECRET}|${ip}`);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM comments WHERE sender = ?1 AND created_at > ?2")
    .bind(sender, hourAgo)
    .first();
  if (recent && recent.n >= MAX_PER_HOUR) {
    return json({ error: "You have sent several comments in a short time. Please try again later." }, 429);
  }

  await env.DB.prepare(
    "INSERT INTO comments (story, name, body, status, created_at, sender) VALUES (?1, ?2, ?3, 'pending', ?4, ?5)"
  )
    .bind(story, name, body, new Date().toISOString(), sender)
    .run();

  return json({ ok: true });
}
