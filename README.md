# Global Mayhem

The news site for Global Mayhem. The name shown on the site is MAYHEM. Tagline: "The chaos, explained."

## How it works

Every story is a plain text file in `src/articles/`. A tool called Eleventy turns each file into its own finished web page, so search engines can read every story on its own. GitHub builds and publishes the site automatically every time something is pushed to the `main` branch.

## Writing a new story

Add a file to `src/articles/`. The file name becomes the web address, so `src/articles/big-thing-happens.md` in the tech section becomes `/tech/big-thing-happens/`. Use lowercase words with hyphens between them.

The top of the file holds the settings, between two lines of three hyphens. The story itself goes underneath, written in Markdown.

```markdown
---
title: "The headline"
summary: "One line that sums it up. Google and X show this under the headline."
section: tech
author: "Your Name"
date: 2026-11-11T15:23:00-04:00
---
The story starts here.

## A subheading

More of the story.
```

### All the settings

| Setting | Needed? | What it does |
|---|---|---|
| `title` | Yes | The headline. |
| `summary` | Yes | One line. Used for the Google snippet and the share card text. |
| `section` | Yes | One of `tech`, `ai`, `gaming`, `canada`, `culture`. |
| `date` | Yes | When it was published. See the note on times below. |
| `author` | No | The byline. If left out it says "Global Mayhem Staff". |
| `updated` | No | When the story was last changed. Shows an "Updated" time. |
| `image` | No | A picture, for example `/assets/images/my-photo.jpg`. Put the file in `src/assets/images/`. |
| `imageAlt` | No | A short description of the picture for people who cannot see it. |
| `imageCredit` | No | Who took the picture. |
| `quote` | No | The strongest quote in the story. The story then leads with it. |
| `quoteSpeaker` | No | Who said it, for example `"Jane Doe, mayor"`. |
| `breaking` | No | `true` puts the story in the pink Breaking bar for 24 hours and makes its share card pink. |
| `live` | No | `true` adds the red Live label. Remove it when coverage ends. |
| `sample` | No | `true` marks placeholder content. It is hidden from Google, the sitemaps and RSS. |

### Times

Times end with the Atlantic time offset. Use `-04:00` in winter (AST) and `-03:00` in summer (ADT). Example: `2026-11-11T15:23:00-04:00` is 3:23 PM AST on November 11, 2026.

### Pink and red

Pink means Breaking: a one-off big story. Red means Live: ongoing coverage. Do not mix them up.

## What gets built automatically

- One page per story with its own title, description, share card tags and `NewsArticle` data for Google.
- A branded share image per story (`/og/file-name.png`), plus a default one.
- The homepage, which shows the top story, the latest stories beside it and the rest in a grid on a computer, and one simple column on a phone.
- `sitemap.xml`, `news-sitemap.xml` (stories from the last two days, for Google News), `robots.txt` and `feed.xml` (RSS).
- A ping to IndexNow after each publish, so Bing and others hear about new stories right away.

## Site settings

The domain, site name and section list live in one file: `src/_data/site.js`.

## Running it on your own computer (optional)

You need Node.js version 22 or newer.

```bash
npm install
```

```bash
npm start
```

Then open the address it prints, usually `http://localhost:8080`.

## Folder guide

- `src/articles/`: the stories.
- `src/_includes/`: the page templates.
- `src/assets/`: styles, logo files and pictures.
- `src/_data/site.js`: site-wide settings.
- `lib/og-card.js`: draws the share images.
- `.github/workflows/deploy.yml`: the instructions GitHub follows to build and publish.

## Section pages

Every story still needs a `section`, because it is part of the web address. The section menu and the section pages themselves are switched off for now. To bring them back, change `showSections` to `true` in `src/_data/site.js`.
