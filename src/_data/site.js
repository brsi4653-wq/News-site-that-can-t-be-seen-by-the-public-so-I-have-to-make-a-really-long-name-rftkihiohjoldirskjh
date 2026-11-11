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
  // Section pages and the section menu are switched off for now.
  // Change this to true to bring them back.
  showSections: false,
  // The X account readers should contact, for example "@globalmayhem".
  // While this is empty, the X buttons and links are hidden.
  xHandle: process.env.X_HANDLE || "@GlobalMayhemCA",
  // Public email addresses shown on the site.
  emails: {
    contact: "contact@globalmayhem.org",
    tips: "tips@globalmayhem.org",
    corrections: "corrections@globalmayhem.org",
  },
  // Reader comments. They only appear on stories once the public
  // Turnstile site key (the spam check) is filled in here.
  comments: {
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "0x4AAAAAAF9e08NmikhIxWmt",
  },
  sections: [
    { slug: "tech", name: "Tech", description: "Tech news from Global Mayhem." },
    { slug: "ai", name: "AI", description: "AI news from Global Mayhem." },
    { slug: "gaming", name: "Gaming", description: "Gaming news from Global Mayhem." },
    { slug: "canada", name: "Canada", description: "Canadian news from Global Mayhem." },
    { slug: "culture", name: "Culture", description: "Culture news from Global Mayhem." },
  ],
};
