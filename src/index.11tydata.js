// Extra settings for the homepage and its "older stories" pages.
const pageNumber = (data) => (data.pagination ? data.pagination.pageNumber : 0);

export default {
  eleventyComputed: {
    // Only the first page of the feed should show up in search results
    noindex: (data) => pageNumber(data) > 0,
    title: (data) =>
      pageNumber(data) > 0 ? `Latest stories, page ${pageNumber(data) + 1}` : "",
    // Tells Google who publishes this site
    schema: (data) => {
      const site = data.site;
      if (!site || pageNumber(data) > 0) return null;
      return {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": site.url + "/#website",
            url: site.url + "/",
            name: site.name,
            alternateName: site.displayName,
            description: site.description,
            inLanguage: site.language,
            publisher: { "@id": site.url + "/#organization" },
          },
          {
            "@type": "NewsMediaOrganization",
            "@id": site.url + "/#organization",
            name: site.name,
            alternateName: site.displayName,
            url: site.url + "/",
            slogan: site.tagline,
            logo: {
              "@type": "ImageObject",
              url: `${site.url}/assets/logo/mayhem-favicon-512.png`,
              width: 512,
              height: 512,
            },
            correctionsPolicy: site.url + "/corrections/",
          },
        ],
      };
    },
  },
};
