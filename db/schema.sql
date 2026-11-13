-- Reader comments. A comment is "pending" until it is approved on the
-- private review page, and only "approved" comments are shown on stories.
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  sender TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_story ON comments (story, status, created_at);
CREATE INDEX IF NOT EXISTS comments_sender ON comments (sender, created_at);

-- Times of recent wrong admin passwords, used to lock the review page
-- when someone is guessing.
CREATE TABLE IF NOT EXISTS admin_attempts (at TEXT NOT NULL);

-- Posts on creator pages (for example /simon/). The site makes these
-- tables by itself the first time they are needed.
CREATE TABLE IF NOT EXISTS creator_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creator TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS creator_posts_creator ON creator_posts (creator, created_at);

-- Times of recent wrong creator passwords, used to lock a creator's login
-- when someone is guessing.
CREATE TABLE IF NOT EXISTS creator_attempts (creator TEXT NOT NULL, at TEXT NOT NULL);

-- Replies from readers under a creator's post. They show right away. The
-- creator can delete any of them from their admin page.
CREATE TABLE IF NOT EXISTS creator_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  sender TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS creator_replies_post ON creator_replies (post_id, created_at);
