// Builds one link preview image per film and per process post.
import { ogCard } from "../lib/og-card.js";

export default class {
  data() {
    return {
      pagination: {
        data: "collections.all",
        size: 1,
        alias: "item",
        before: (items) => items.filter((i) => i.data.isFilm || i.data.isPost),
      },
      permalink: (data) =>
        `/og/${data.item.data.isFilm ? "film" : "post"}-${data.item.fileSlug}.png`,
      eleventyExcludeFromCollections: true,
    };
  }

  async render(data) {
    const { item, site } = data;
    return ogCard({
      headline: item.data.title,
      label: item.data.isFilm ? item.data.kind || "Film" : "Process",
      footer: site.url.replace(/^https?:\/\//, ""),
    });
  }
}
