// Builds one link preview image per article at /og/file-name.png
import { ogCard } from "../lib/og-card.js";

export default class {
  data() {
    return {
      pagination: { data: "collections.articles", size: 1, alias: "article" },
      permalink: (data) => `/og/${data.article.fileSlug}.png`,
      eleventyExcludeFromCollections: true,
    };
  }

  async render(data) {
    const { article, site } = data;
    const section = site.sections.find((s) => s.slug === article.data.section);
    return ogCard({
      headline: article.data.title,
      label: section ? section.name : "",
      footer: site.url.replace(/^https?:\/\//, ""),
      breaking: Boolean(article.data.breaking),
    });
  }
}
