# Global Mayhem

The site for Global Mayhem, a film and content studio. The name shown on the site is MAYHEM.

Global Mayhem started as a news site on November 11, 2026 and became a studio on November 13, 2026. The news stories are kept at `/archive/`.

## How it works

Every film, process post and old news story is a plain text file. A tool called Eleventy turns each file into its own finished web page. The site is published to Cloudflare Pages with `scripts/deploy.sh` (see Publishing at the end). GitHub only stores the files.

## Adding a film or video

Add a file to `src/work/`. The file name becomes the web address, so `src/work/my-film.md` becomes `/work/my-film/`. Everything in this folder shows on the Work page.

```markdown
---
title: "My Film"
summary: "One line about the film."
status: "In production"
kind: "Short film"
length: "About 2 minutes"
facts:
  - "No dialogue"
order: 1
date: 2026-11-13T12:00:00-04:00
---
Anything written here shows on the film page. It can be left empty.
```

| Setting | Needed? | What it does |
|---|---|---|
| `title` | Yes | The film's name. |
| `summary` | No | One line shown under the title. |
| `status` | No | For example "In production" or "Out now". Shown in pink. |
| `kind` | No | For example "Short film" or "One-minute film". |
| `length` | No | The running time. |
| `facts` | No | Short labels shown under the summary. |
| `video` | No | A YouTube link. The film then plays on its page. |
| `poster` | No | A picture, for example `/assets/images/my-poster.jpg`. Add `posterAlt` to describe it. |
| `order` | Yes | Lowest number is shown first. The first film is the big one on the homepage. |
| `date` | Yes | Used by the RSS feed. |

## Adding a behind the scenes post

Add a file to `src/posts/`. `src/posts/first-day.md` becomes `/process/first-day/`. New posts show on the homepage, on the Behind the scenes page (`/process/`), and on the page of the film they belong to.

```markdown
---
title: "First day of shooting"
summary: "Optional one line shown in lists."
film: my-film
date: 2026-11-14T15:00:00-04:00
video: https://www.youtube.com/watch?v=XXXXXXXXXXX
---
The post goes here.
```

`film` is the file name of the film, without `.md`. `video` (a YouTube link) and `image` are optional.

## News archive

The sections below describe the news stories in `src/articles/`. They still work, but no new stories are planned.

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
| `titleNote` | No | A small label under the headline on the story page, for example "Updated title". |
| `image` | No | A picture, for example `/assets/images/my-photo.jpg`. Put the file in `src/assets/images/`. |
| `xPost` | No | A link to a post on X, for example a video. The post is shown at the top of the story with a credit to the account. If you also give an `image`, the story page shows the X post and the image is used as the picture on the homepage. |
| `imageAlt` | No | A short description of the picture for people who cannot see it. |
| `imageCredit` | No | Who took the picture. |
| `quote` | No | The strongest quote in the story. The story then leads with it. |
| `quoteSpeaker` | No | Who said it, for example `"Jane Doe, mayor"`. |
| `breaking` | No | `true` puts the story in the pink Breaking bar for 24 hours and makes its share card pink. |
| `live` | No | `true` adds the red Live label. It switches itself off when its clock runs out. |
| `liveHours` | No | How long the Live label stays on, in hours. If left out it is 24. The clock starts at `date`, or at `updated` if the story has one. |
| `sample` | No | `true` marks placeholder content. It is hidden from Google, the sitemaps and RSS. |

### Times

Times end with the Atlantic time offset. Use `-04:00` in winter (AST) and `-03:00` in summer (ADT). Example: `2026-11-11T15:23:00-04:00` is 3:23 PM AST on November 11, 2026.

### Pink and red

Pink means Breaking: a one-off big story. Red means Live: ongoing coverage. Do not mix them up.

## What gets built automatically

- One page per story with its own title, description, share card tags and `NewsArticle` data for Google.
- A branded share image per story (`/og/file-name.png`), plus a default one.
- The news archive page at `/archive/`.
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

- `src/work/`: the films and videos.
- `src/posts/`: the behind the scenes posts.
- `src/articles/`: the old news stories.
- `src/_includes/`: the page templates.
- `src/assets/`: styles, logo files and pictures.
- `src/_data/site.js`: site-wide settings.
- `lib/og-card.js`: draws the share images.
- `.github/workflows/publish.yml`: the instructions GitHub follows to build and publish.

## Section pages

Every story still needs a `section`, because it is part of the web address. The section menu and the section pages themselves are switched off for now. To bring them back, change `showSections` to `true` in `src/_data/site.js`.

## Creators page

`/creators/` shows one card per person listed under `creators` in `src/_data/site.js`: name, role, X username, photo and banner. The pictures are files in `src/assets/images/`. To change one, replace the file and publish.

## Comments

Readers can comment under every story. Comments are stored on Cloudflare and are hidden until they are approved.

- `functions/api/comments.js`: lists approved comments and accepts new ones. New comments pass a Cloudflare Turnstile spam check and are saved as "pending".
- `functions/api/admin/comments.js`: approve and delete, protected by the admin password.
- `src/_includes/comments.njk`: the comment box shown under stories.
- `src/admin-comments.njk`: the private review page at `/admin/comments/`.
- `db/schema.sql`: the layout of the database.

Settings that live on the Cloudflare Pages project `globalmayhem`, not in this repo:

- `DB`: the D1 database `globalmayhem-comments`.
- `TURNSTILE_SECRET`: the secret half of the spam check.
- `ADMIN_PASSWORD`: the password for the review page. At least 7 characters. After 8 wrong tries the review page locks for 15 minutes. Set it in the Cloudflare dashboard, then publish again so it takes effect.

To switch comments off, empty `comments.turnstileSiteKey` in `src/_data/site.js` and publish.

## Publishing

`scripts/deploy.sh` builds the site and uploads it, together with the `functions` folder, to Cloudflare Pages. It needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set in the shell. Never save the token in this repo.
