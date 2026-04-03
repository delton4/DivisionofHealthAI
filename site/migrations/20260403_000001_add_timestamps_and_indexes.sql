-- Migration: Add missing timestamps and indexes
-- Adds created_at/updated_at to admin_users and hidden_entities.
-- Adds indexes for ORDER BY and batch override queries.

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE hidden_entities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes for ORDER BY created_at DESC queries
CREATE INDEX IF NOT EXISTS idx_custom_publications_created ON custom_publications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_projects_created ON custom_projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_researchers_created ON custom_researchers (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_db_alumni_created ON db_alumni (created_at DESC);

-- Index for batch override lookups
CREATE INDEX IF NOT EXISTS idx_text_overrides_entity ON text_overrides (entity, entity_id);
