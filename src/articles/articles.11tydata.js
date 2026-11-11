// Settings shared by every article in this folder.
// The address of an article is /section/file-name/
const sectionSlugs = ["tech", "ai", "gaming", "canada", "culture"];

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
    ogImage: (data) => `/og/${data.page.fileSlug}.png`,
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
