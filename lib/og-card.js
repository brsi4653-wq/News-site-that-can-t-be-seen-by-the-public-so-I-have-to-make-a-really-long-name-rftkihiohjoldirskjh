// Makes the branded link preview image (1200 x 630) that shows up when a
// story is shared on X and other apps: the mark, the section and the headline.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const require = createRequire(import.meta.url);
const font = (path) => readFileSync(require.resolve(path));

const fonts = [
  { name: "Anton", data: font("@fontsource/anton/files/anton-latin-400-normal.woff"), weight: 400, style: "normal" },
  { name: "Anton", data: font("@fontsource/anton/files/anton-latin-ext-400-normal.woff"), weight: 400, style: "normal" },
  { name: "JetBrains Mono", data: font("@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff"), weight: 700, style: "normal" },
];

const BLACKOUT = "#111111";
const BONE = "#f3f0e8";
const PINK = "#ff2e88";

const el = (type, style, children, extra = {}) => ({
  type,
  props: { style, children, ...extra },
});

// Same geometry as the logo files (viewBox 0 0 92 64)
const mark = (width, fill) =>
  el("svg", {}, [
    el("path", {}, undefined, { d: "M0 0H40V34L24 64H9L20 38H0Z", fill }),
    el("path", {}, undefined, { d: "M52 0H92V34L76 64H61L72 38H52Z", fill }),
  ], { width, height: Math.round((width * 64) / 92), viewBox: "0 0 92 64" });

const headlineSize = (text) => {
  const n = text.length;
  if (n <= 28) return 132;
  if (n <= 45) return 108;
  if (n <= 70) return 88;
  if (n <= 100) return 72;
  return 60;
};

/**
 * headline: the big text. label: small text above it (section name).
 * breaking: true gives a pink card with black text. Otherwise black with pink.
 */
export async function ogCard({ headline, label = "", footer = "", breaking = false }) {
  const bg = breaking ? PINK : BLACKOUT;
  const fg = breaking ? BLACKOUT : BONE;
  const accent = breaking ? BLACKOUT : PINK;
  const text = headline.toUpperCase();
  const mono = { fontFamily: "JetBrains Mono", fontSize: 24, letterSpacing: 3.5 };

  const tree = el(
    "div",
    {
      width: 1080, height: 526, display: "flex", flexDirection: "column",
      justifyContent: "space-between", color: fg,
    },
    [
      el("div", { display: "flex", justifyContent: "space-between", alignItems: "center" }, [
        el("div", { display: "flex", alignItems: "center" }, [
          mark(72, accent),
          el("div", { fontFamily: "Anton", fontSize: 58, lineHeight: 1, marginLeft: 18 }, "MAYHEM"),
        ]),
        el("div", { ...mono, color: accent }, (breaking ? "BREAKING" : label).toUpperCase()),
      ]),
      el(
        "div",
        {
          display: "flex", fontFamily: "Anton", fontSize: headlineSize(text), lineHeight: 1.04,
          maxHeight: 380, overflow: "hidden", wordBreak: "break-word",
        },
        text
      ),
      el("div", { display: "flex", alignItems: "center" }, [
        el("div", { width: 64, height: 8, backgroundColor: accent, marginRight: 18 }),
        el("div", { ...mono, fontSize: 22, color: fg }, footer.toUpperCase()),
      ]),
    ]
  );

  const frame = el(
    "div",
    { width: 1200, height: 630, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: bg },
    [tree]
  );

  const svg = await satori(frame, { width: 1200, height: 630, fonts });
  return new Resvg(svg).render().asPng();
}
