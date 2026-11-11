import site from "./src/_data/site.js";

const HOUR = 60 * 60 * 1000;
const tz = site.timezone;

const fmt = (options, locale = "en-US") =>
  new Intl.DateTimeFormat(locale, { timeZone: tz, ...options });

const timeFmt = fmt({ hour: "numeric", minute: "2-digit", hour12: true });
const shortDateFmt = fmt({ month: "short", day: "numeric" });
const longDateFmt = fmt({ month: "long", day: "numeric", year: "numeric" });
const zoneFmt = fmt({ timeZoneName: "short", hour: "numeric" }, "en-CA");

// "AST" in winter, "ADT" in summer
const zoneName = (date) =>
  zoneFmt.formatToParts(date).find((p) => p.type === "timeZoneName").value;

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  const buildTime = new Date();
  eleventyConfig.addGlobalData("buildTime", buildTime);

  // Every article, newest first
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/articles/*.md").sort((a, b) => b.date - a.date)
  );

  // Real articles only (samples are kept out of sitemaps and the RSS feed)
  eleventyConfig.addCollection("published", (api) =>
    api
      .getFilteredByGlob("src/articles/*.md")
      .filter((a) => !a.data.sample)
      .sort((a, b) => b.date - a.date)
  );

  // Google News only wants stories from the last two days
  eleventyConfig.addCollection("recentNews", (api) =>
    api
      .getFilteredByGlob("src/articles/*.md")
      .filter((a) => !a.data.sample && buildTime - a.date < 48 * HOUR)
      .sort((a, b) => b.date - a.date)
  );

  // The pink Breaking bar shows the newest breaking story for 24 hours
  eleventyConfig.addCollection("breaking", (api) =>
    api
      .getFilteredByGlob("src/articles/*.md")
      .filter((a) => a.data.breaking && buildTime - a.date < 24 * HOUR)
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("time", (d) => timeFmt.format(new Date(d)));
  eleventyConfig.addFilter("shortDate", (d) => shortDateFmt.format(new Date(d)));
  eleventyConfig.addFilter("fullDate", (d) => {
    const date = new Date(d);
    return `${longDateFmt.format(date)} at ${timeFmt.format(date)} ${zoneName(date)}`;
  });
  eleventyConfig.addFilter("iso", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("rfc822", (d) => new Date(d).toUTCString());
  // A number that changes on every build. Added to the style file's address
  // so browsers fetch the new styles instead of using an old saved copy.
  eleventyConfig.addFilter("version", (d) => String(new Date(d).getTime()));
  eleventyConfig.addFilter("year", (d) => new Date(d).getFullYear());
  eleventyConfig.addFilter("absolute", (path) => site.url + path);
  eleventyConfig.addFilter("inSection", (items, slug) =>
    (items || []).filter((a) => a.data.section === slug)
  );
  // Other stories to suggest next to an article
  eleventyConfig.addFilter("others", (items, url, count) =>
    (items || []).filter((a) => a.url !== url).slice(0, count)
  );
  // "@name" becomes "name", for building x.com links
  eleventyConfig.addFilter("xUser", (handle) => String(handle || "").replace(/^@/, ""));
  // X post links: the embed needs the twitter.com form of the address,
  // without tracking extras on the end.
  eleventyConfig.addFilter("xEmbedUrl", (link) => {
    const m = String(link || "").match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status\/(\d+)/);
    return m ? `https://twitter.com/${m[1]}/status/${m[2]}` : "";
  });
  // The account that posted it, for the credit line
  eleventyConfig.addFilter("xPostUser", (link) => {
    const m = String(link || "").match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/status\//);
    return m ? m[1] : "";
  });
  eleventyConfig.addFilter("sectionName", (slug) => {
    const s = site.sections.find((x) => x.slug === slug);
    return s ? s.name : slug;
  });
  // Safe JSON for <script type="application/ld+json">
  eleventyConfig.addFilter("jsonld", (obj) =>
    JSON.stringify(obj).replace(/</g, "\\u003c")
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
