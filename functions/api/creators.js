// Reads the X profiles shown on the Creators page: name, photo, banner,
// bio and latest post. The answer is saved for one day, so X is only
// asked once a day however many people open the page.
//
// Needs one secret on the Cloudflare Pages project: X_BEARER_TOKEN, a
// Bearer Token from the X developer console (console.x.com). Without it
// this returns an empty list and the page keeps its plain look.

// Only these X usernames are ever looked up. Keep in step with
// "creators" in src/_data/site.js.
const HANDLES = ["SimonofGM"];

const DAY = 24 * 60 * 60;
const API = "https://api.x.com/2";

const json = (body, maxAge) =>
  new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });

async function lookUp(handle, token) {
  const headers = { authorization: `Bearer ${token}` };
  const userRes = await fetch(
    `${API}/users/by/username/${handle}?user.fields=name,description,profile_image_url,profile_banner_url`,
    { headers }
  );
  if (!userRes.ok) throw new Error(`X user lookup failed: ${userRes.status}`);
  const user = (await userRes.json()).data;
  if (!user) throw new Error("X user not found");

  const out = {
    name: user.name || "",
    bio: user.description || "",
    // X hands back a tiny photo. Dropping "_normal" gives the full size one.
    avatar: (user.profile_image_url || "").replace("_normal.", "_400x400."),
    banner: "",
    post: null,
  };
  // The banner address sometimes comes without a size on the end.
  if (user.profile_banner_url) {
    out.banner = /\/\d+x\d+$/.test(user.profile_banner_url)
      ? user.profile_banner_url
      : `${user.profile_banner_url}/1500x500`;
  }

  // Latest post of their own (no replies, no reposts). 5 is the fewest X allows.
  const postsRes = await fetch(
    `${API}/users/${user.id}/tweets?max_results=5&exclude=replies,retweets&tweet.fields=created_at`,
    { headers }
  );
  if (postsRes.ok) {
    const post = ((await postsRes.json()).data || [])[0];
    if (post) {
      out.post = {
        text: post.text,
        date: post.created_at || "",
        url: `https://x.com/${handle}/status/${post.id}`,
      };
    }
  }
  return out;
}

export async function onRequestGet({ request, env, waitUntil }) {
  if (!env.X_BEARER_TOKEN) return json({ creators: {} }, 300);

  const cache = caches.default;
  const key = new Request(new URL("/api/creators", request.url).toString());
  const saved = await cache.match(key);
  if (saved) return saved;

  const creators = {};
  let failed = false;
  for (const handle of HANDLES) {
    try {
      creators[handle.toLowerCase()] = await lookUp(handle, env.X_BEARER_TOKEN);
    } catch (e) {
      failed = true;
    }
  }
  // A good answer is kept for a day. A failed one is retried after an hour.
  const response = json({ creators }, failed ? 3600 : DAY);
  waitUntil(cache.put(key, response.clone()));
  return response;
}
