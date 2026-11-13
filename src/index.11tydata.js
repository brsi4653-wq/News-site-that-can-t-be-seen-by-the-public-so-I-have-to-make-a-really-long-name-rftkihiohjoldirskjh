// Extra settings for the homepage.
export default {
  eleventyComputed: {
    // Tells Google who publishes this site
    schema: (data) => {
      const site = data.site;
      if (!site) return null;
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
            "@type": "Organization",
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
          },
        ],
      };
    },
  },
};
