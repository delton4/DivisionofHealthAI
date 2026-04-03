-- Migration: Initial schema (baseline)
-- Captures existing tables as they were before migration system.
-- Safe to run on existing databases due to IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS text_overrides (
  id         SERIAL PRIMARY KEY,
  entity     TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  field      TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity, entity_id, field)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_publications (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  journal         TEXT NOT NULL DEFAULT '',
  abstract        TEXT NOT NULL DEFAULT '',
  publication_url TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hidden_entities (
  entity    TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  PRIMARY KEY (entity, entity_id)
);

CREATE TABLE IF NOT EXISTS custom_projects (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  about      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_researchers (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  title      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS db_alumni (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  credentials TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, credentials)
);
