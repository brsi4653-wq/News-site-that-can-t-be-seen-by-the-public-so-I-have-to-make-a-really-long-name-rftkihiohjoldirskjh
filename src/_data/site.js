// Site-wide settings. Change the domain here (one place) if it ever changes.
export default {
  name: "Global Mayhem", // official and legal name: titles, footer, metadata
  displayName: "MAYHEM", // the name shown in the header and logo lockups
  tagline: "The chaos, explained.",
  description:
    "Global Mayhem is a Canadian news site covering tech, AI, gaming, Canada and culture. The chaos, explained.",
  url: (process.env.SITE_URL || "https://globalmayhem.org").replace(/\/$/, ""),
  language: "en-CA",
  timezone: "America/Halifax", // Atlantic time, shown as AST or ADT
  defaultAuthor: "Global Mayhem Staff",
  xHandle: "", // for example "@globalmayhem". Leave empty until the account exists.
  sections: [
    { slug: "tech", name: "Tech", description: "Tech news from Global Mayhem." },
    { slug: "ai", name: "AI", description: "AI news from Global Mayhem." },
    { slug: "gaming", name: "Gaming", description: "Gaming news from Global Mayhem." },
    { slug: "canada", name: "Canada", description: "Canadian news from Global Mayhem." },
    { slug: "culture", name: "Culture", description: "Culture news from Global Mayhem." },
  ],
};
