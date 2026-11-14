// Site-wide settings. Change the domain here (one place) if it ever changes.
export default {
  name: "Global Mayhem", // official and legal name: titles, footer, metadata
  displayName: "MAYHEM", // the name shown in the header and logo lockups
  tagline: "Film and content studio", // the short line under the name
  description:
    "Global Mayhem is a Canadian film and content studio. Films and video, made in Canada.",
  url: (process.env.SITE_URL || "https://globalmayhem.org").replace(/\/$/, ""),
  language: "en-CA",
  timezone: "America/Halifax", // Atlantic time, shown as AST or ADT
  defaultAuthor: "Global Mayhem Staff",
  // The menu in the header.
  nav: [
    { name: "Work", url: "/work/" },
    { name: "About", url: "/about/" },
    { name: "Contact", url: "/contact/" },
    { name: "Creators", url: "/creators/" },
  ],
  // Social accounts shown in the Socials block at the bottom of every page.
  socials: [{ name: "X", handle: "@GlobalMayhemCA", url: "https://x.com/GlobalMayhemCA" }],
  // People shown on the Creators page. "x" is their X username, without the @.
  // "avatar" and "banner" are pictures in src/assets/images/.
  // "slug" is their page address: "simon" gives globalmayhem.org/simon/. That page is a list of link buttons.
  creators: [
    {
      slug: "simon",
      name: "Simon",
      role: "CEO and Founder",
      // The buttons on their page, top to bottom. "note" is the small text on the right.
      links: [
        { name: "X", note: "@SimonofGM", url: "https://x.com/SimonofGM" },
        { name: "Global Mayhem on X", note: "@GlobalMayhemCA", url: "https://x.com/GlobalMayhemCA" },
        { name: "Global Mayhem", note: "globalmayhem.org", url: "/" },
        { name: "Email", note: "contact@globalmayhem.org", url: "mailto:contact@globalmayhem.org" },
      ],
      x: "SimonofGM",
      avatar: "/assets/images/creator-simon.webp",
      banner: "/assets/images/creator-simon-banner.webp",
    },
  ],
  // News section pages (from when this was a news site) are switched off for now.
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
  // Motion and visual effects. Each name here switches one effect on.
  // Choices: ticker, scramble, wipe, reveal, hover, progress, transitions, live, grain,
  // intro (opening sequence), hero (big titles rise in), marquee (moving band), cursor (pink pointer)
  effects: ["ticker", "scramble", "wipe", "reveal", "hover", "progress", "transitions", "live", "grain", "intro", "hero", "marquee"],
  allEffects: ["ticker", "scramble", "wipe", "reveal", "hover", "progress", "transitions", "live", "grain", "intro", "hero", "marquee", "cursor"],
  // Preview builds show every effect with an on/off panel. Never used on the real site.
  preview: process.env.PREVIEW_FX === "1",
  sections: [
    { slug: "tech", name: "Tech", description: "Tech news from Global Mayhem." },
    { slug: "ai", name: "AI", description: "AI news from Global Mayhem." },
    { slug: "gaming", name: "Gaming", description: "Gaming news from Global Mayhem." },
    { slug: "canada", name: "Canada", description: "Canadian news from Global Mayhem." },
    { slug: "culture", name: "Culture", description: "Culture news from Global Mayhem." },
  ],
};
