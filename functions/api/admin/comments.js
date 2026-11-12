// Private review tools for comments. Every request needs the admin password.
//   GET  /api/admin/comments?status=pending   lists comments (pending or approved)
//   POST /api/admin/comments                  { id, action: "approve" | "delete" }

const MIN_PASSWORD = 7; // shortest admin password the site will accept
const MAX_WRONG = 8; // wrong passwords allowed before the page locks
const LOCK_MINUTES = 15;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function digest(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

// Compare the password without leaking how much of it was right
async function allowed(request, env) {
  const expected = env.ADMIN_PASSWORD || "";
  if (expected.length < MIN_PASSWORD) return null; // not set up, or too short
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Wrong passwords are counted. After too many in a short time the review
// page locks for everyone for a while, so the password cannot be guessed
// by trying thousands of combinations.
async function guard(request, env) {
  const since = new Date(Date.now() - LOCK_MINUTES * 60 * 1000).toISOString();
  const wrong = await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_attempts WHERE at > ?1").bind(since).first();
  if (wrong && wrong.n >= MAX_WRONG) {
    return json({ error: `Too many wrong passwords. The review page is locked for up to ${LOCK_MINUTES} minutes.` }, 429);
  }
  const ok = await allowed(request, env);
  if (ok === null) return json({ error: "The admin password has not been set up yet." }, 503);
  if (!ok) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM admin_attempts WHERE at <= ?1").bind(since),
      env.DB.prepare("INSERT INTO admin_attempts (at) VALUES (?1)").bind(new Date().toISOString()),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // slow down guessing
    return json({ error: "Wrong password." }, 401);
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const blocked = await guard(request, env);
  if (blocked) return blocked;
  const status = new URL(request.url).searchParams.get("status") === "approved" ? "approved" : "pending";
  const { results } = await env.DB.prepare(
    "SELECT id, story, name, body, status, created_at FROM comments WHERE status = ?1 ORDER BY created_at DESC LIMIT 200"
  )
    .bind(status)
    .all();
  return json({ comments: results });
}

export async function onRequestPost({ request, env }) {
  const blocked = await guard(request, env);
  if (blocked) return blocked;
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }
  const id = Number(data.id);
  if (!Number.isInteger(id)) return json({ error: "Unknown comment." }, 400);
  if (data.action === "approve") {
    await env.DB.prepare("UPDATE comments SET status = 'approved' WHERE id = ?1").bind(id).run();
  } else if (data.action === "delete") {
    await env.DB.prepare("DELETE FROM comments WHERE id = ?1").bind(id).run();
  } else {
    return json({ error: "Unknown action." }, 400);
  }
  return json({ ok: true });
}
