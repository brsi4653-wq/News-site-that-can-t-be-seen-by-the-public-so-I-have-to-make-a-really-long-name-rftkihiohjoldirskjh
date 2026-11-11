import { createHash } from "node:crypto";
// Settings shared by every article in this folder.
// The address of an article is /section/file-name/
const sectionSlugs = ["tech", "ai", "gaming", "canada", "culture"];

const HOUR = 60 * 60 * 1000;

// When the red Live label should switch itself off. The clock starts at the
// published time, or at the updated time if the story has one.
// liveHours sets the length. With no liveHours it is 24 hours.
const liveUntil = (data) => {
  if (!data.live || !data.page || !data.page.date) return null;
  const hours = Number(data.liveHours) > 0 ? Number(data.liveHours) : 24;
  const start = new Date(data.updated || data.page.date).getTime();
  return new Date(start + hours * HOUR);
};

const urlFor = (data) => `/${data.section}/${data.page.fileSlug}/`;

export default {
  layout: "layouts/article.njk",
  isArticle: true,
  eleventyComputed: {
    permalink: (data) => {
      if (data.section && !sectionSlugs.includes(data.section)) {
        throw new Error(
          `${data.page.inputPath}: section "${data.section}" is not one of ${sectionSlugs.join(", ")}`
        );
      }
      return urlFor(data);
    },
    description: (data) => data.summary,
    noindex: (data) => Boolean(data.sample),
    liveUntil: (data) => liveUntil(data),
    // True only while the Live clock is still running
    isLive: (data) => {
      const until = liveUntil(data);
      return Boolean(until && (data.buildTime || new Date()) < until);
    },
    // The Breaking bar and pink share card last 24 hours
    breakingUntil: (data) =>
      data.breaking && data.page && data.page.date
        ? new Date(new Date(data.page.date).getTime() + 24 * HOUR)
        : null,
    // The address carries a short code made from the headline. When the
    // headline changes the address changes, so X and others fetch the new card.
    ogImage: (data) =>
      `/og/${data.page.fileSlug}.png?v=${createHash("sha1").update(`${data.title || ""}|${data.breaking ? 1 : 0}`).digest("hex").slice(0, 8)}`,
    // NewsArticle structured data for Google
    schema: (data) => {
      const site = data.site;
      if (!site || !data.page || !data.page.date) return null;
      const images = [`${site.url}/og/${data.page.fileSlug}.png`];
      if (data.image) images.unshift(site.url + data.image);
      return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": site.url + urlFor(data) },
        headline: data.title,
        description: data.summary,
        image: images,
        datePublished: new Date(data.page.date).toISOString(),
        dateModified: new Date(data.updated || data.page.date).toISOString(),
        articleSection: (site.sections.find((s) => s.slug === data.section) || {}).name,
        author: data.author
          ? { "@type": "Person", name: data.author }
          : { "@type": "Organization", name: site.name, url: site.url + "/" },
        publisher: {
          "@type": "NewsMediaOrganization",
          name: site.name,
          url: site.url + "/",
          logo: {
            "@type": "ImageObject",
            url: `${site.url}/assets/logo/mayhem-favicon-512.png`,
            width: 512,
            height: 512,
          },
        },
      };
    },
  },
};
