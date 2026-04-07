-- Association overrides: add/remove publications and projects from researcher profiles.
-- Each row represents a delta on top of the static JSON associations.
-- The UNIQUE constraint ensures one state per researcher-entity pair; upserts flip between add/remove.

CREATE TABLE IF NOT EXISTS association_overrides (
  id            SERIAL PRIMARY KEY,
  researcher_id TEXT NOT NULL,
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('publication', 'project')),
  entity_id     TEXT NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('add', 'remove')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(researcher_id, entity_type, entity_id)
);

-- Forward lookup: researcher profile page fetches overrides for a given researcher
CREATE INDEX IF NOT EXISTS idx_assoc_overrides_researcher
  ON association_overrides (researcher_id, entity_type);

-- Reverse lookup: project/publication page finds which researchers were added/removed
CREATE INDEX IF NOT EXISTS idx_assoc_overrides_entity
  ON association_overrides (entity_type, entity_id);
