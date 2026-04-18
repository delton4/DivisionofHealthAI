/** Fields that text_overrides are allowed to set per entity type.
 *  Used by both the write path (actions.ts) and the read path (data/index.ts)
 *  to prevent overrides from injecting id, slug, or other structural fields. */

export const VALID_ENTITIES = new Set(["researcher", "project", "publication", "page"]);

export const VALID_FIELDS: Record<string, Set<string>> = {
  researcher: new Set(["name", "title", "about", "photo", "credentials"]),
  project: new Set(["name", "about"]),
  publication: new Set(["name", "journal", "abstract", "publicationUrl"]),
};

export const VALID_PAGE_IDS = new Set(["home", "about", "join"]);

export const VALID_PAGE_FIELDS: Record<string, Set<string>> = {
  home: new Set(["subtitle", "highlight_desc"]),
  about: new Set([
    "intro1", "intro2", "approach1", "approach2",
    "achieve1_title", "achieve1_desc", "achieve2_title", "achieve2_desc",
    "achieve3_title", "achieve3_desc", "achieve4_title", "achieve4_desc",
  ]),
  join: new Set(["intro", "scholar_desc", "collab_desc", "location_desc"]),
};
