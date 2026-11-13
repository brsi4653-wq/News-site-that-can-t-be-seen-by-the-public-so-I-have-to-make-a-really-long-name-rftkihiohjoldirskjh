// The fallback link preview image, used by every page that is not an article.
import { ogCard } from "../lib/og-card.js";

export default class {
  data() {
    return { permalink: "/og/default.png", eleventyExcludeFromCollections: true };
  }

  async render(data) {
    return ogCard({
      headline: data.site.tagline,
      label: "Studio",
      footer: data.site.url.replace(/^https?:\/\//, ""),
    });
  }
}
