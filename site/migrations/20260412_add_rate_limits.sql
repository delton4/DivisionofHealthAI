-- Rate limiting table for login attempts (replaces in-memory rate limiter)
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT        PRIMARY KEY,
  count        INTEGER     NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);
