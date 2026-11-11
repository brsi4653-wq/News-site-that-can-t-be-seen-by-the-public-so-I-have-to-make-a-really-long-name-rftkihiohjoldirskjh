// Private review tools for comments. Every request needs the admin password.
//   GET  /api/admin/comments?status=pending   lists comments (pending or approved)
//   POST /api/admin/comments                  { id, action: "approve" | "delete" }

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
  if (expected.length < 12) return null; // not set up, or too short to be safe
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function guard(request, env) {
  const ok = await allowed(request, env);
  if (ok === null) return json({ error: "The admin password has not been set up yet." }, 503);
  if (!ok) {
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
