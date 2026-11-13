// Posts on a creator's own page (for example /simon/).
//   GET  /api/posts?creator=simon     lists that creator's posts, newest first
//   GET  /api/posts?creator=simon&check=1   checks the password (used by the login)
//   POST /api/posts   { creator, action: "post", body }  or  { creator, action: "delete", id }
// Writing needs the creator's own password, stored as a secret on the
// Cloudflare Pages project. See PASSWORD_SECRETS below.

// Only these page names can have posts. Keep in step with "creators" in
// src/_data/site.js.
const CREATORS = ["simon"];

// Which secret holds each creator's password. Simon uses the same password
// as the comments review page. Anyone not listed here uses a secret named
// CREATOR_PASSWORD_ plus their page name in capitals.
const PASSWORD_SECRETS = { simon: "ADMIN_PASSWORD" };

const MIN_PASSWORD = 7;
const MAX_WRONG = 8; // wrong passwords allowed before that creator's login locks
const LOCK_MINUTES = 15;
const MAX_BODY = 1000;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const clean = (value) =>
  String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// The tables are made the first time they are needed.
async function ready(env) {
  await env.DB.batch([
    env.DB.prepare(
      "CREATE TABLE IF NOT EXISTS creator_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, creator TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL)"
    ),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS creator_posts_creator ON creator_posts (creator, created_at)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS creator_attempts (creator TEXT NOT NULL, at TEXT NOT NULL)"),
  ]);
}

async function digest(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

// Checks the password. Wrong ones are counted, and after too many in a
// short time that creator's login locks for a while.
async function guard(request, env, creator) {
  const since = new Date(Date.now() - LOCK_MINUTES * 60 * 1000).toISOString();
  const wrong = await env.DB.prepare("SELECT COUNT(*) AS n FROM creator_attempts WHERE creator = ?1 AND at > ?2")
    .bind(creator, since)
    .first();
  if (wrong && wrong.n >= MAX_WRONG) {
    return json({ error: `Too many wrong passwords. This login is locked for up to ${LOCK_MINUTES} minutes.` }, 429);
  }
  const expected = env[PASSWORD_SECRETS[creator] || `CREATOR_PASSWORD_${creator.toUpperCase()}`] || "";
  if (expected.length < MIN_PASSWORD) return json({ error: "The password for this page has not been set up yet." }, 503);
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM creator_attempts WHERE at <= ?1").bind(since),
      env.DB.prepare("INSERT INTO creator_attempts (creator, at) VALUES (?1, ?2)").bind(creator, new Date().toISOString()),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // slow down guessing
    return json({ error: "Wrong password." }, 401);
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const creator = (url.searchParams.get("creator") || "").toLowerCase();
  if (!CREATORS.includes(creator)) return json({ error: "Unknown page." }, 400);
  await ready(env);
  if (url.searchParams.get("check")) {
    const blocked = await guard(request, env, creator);
    if (blocked) return blocked;
  }
  const { results } = await env.DB.prepare(
    "SELECT id, body, created_at FROM creator_posts WHERE creator = ?1 ORDER BY created_at DESC, id DESC LIMIT 200"
  )
    .bind(creator)
    .all();
  return json({ posts: results });
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "Could not read the request." }, 400);
  }
  const creator = String(data.creator || "").toLowerCase();
  if (!CREATORS.includes(creator)) return json({ error: "Unknown page." }, 400);
  await ready(env);
  const blocked = await guard(request, env, creator);
  if (blocked) return blocked;

  if (data.action === "post") {
    const body = clean(data.body);
    if (!body) return json({ error: "Write something first." }, 400);
    if (body.length > MAX_BODY) return json({ error: `Posts can be up to ${MAX_BODY} characters.` }, 400);
    await env.DB.prepare("INSERT INTO creator_posts (creator, body, created_at) VALUES (?1, ?2, ?3)")
      .bind(creator, body, new Date().toISOString())
      .run();
  } else if (data.action === "delete") {
    const id = Number(data.id);
    if (!Number.isInteger(id)) return json({ error: "Unknown post." }, 400);
    await env.DB.prepare("DELETE FROM creator_posts WHERE id = ?1 AND creator = ?2").bind(id, creator).run();
  } else {
    return json({ error: "Unknown action." }, 400);
  }
  return json({ ok: true });
}
