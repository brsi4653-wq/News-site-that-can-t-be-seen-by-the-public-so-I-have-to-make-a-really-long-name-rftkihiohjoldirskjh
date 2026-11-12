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
