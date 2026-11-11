// Tells IndexNow (Bing, DuckDuckGo and others) which pages are new.
// It reads the live Google News sitemap, which lists stories from the last
// two days, and submits those addresses plus the homepage.
// Runs after each deploy. It does nothing harmful if the site is not live yet.
import site from "../src/_data/site.js";

const KEY = "f5ef2a772d884c0b9f5df235cc2e87e1"; // public by design, matches src/static/<key>.txt
const host = new URL(site.url).host;

const response = await fetch(`${site.url}/news-sitemap.xml`);
if (!response.ok) {
  console.log(`Could not read the news sitemap (${response.status}). Skipping.`);
  process.exit(0);
}

const xml = await response.text();
const stories = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (stories.length === 0) {
  console.log("No recent stories to submit.");
  process.exit(0);
}

const urlList = [`${site.url}/`, ...stories];
const result = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${site.url}/${KEY}.txt`, urlList }),
});
console.log(`Submitted ${urlList.length} addresses to IndexNow. Response: ${result.status}`);
