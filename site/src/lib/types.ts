export interface Researcher {
  id: string;
  name: string;
  title: string;
  about: string;
  slug: string;
  projectIds: string[];
  publicationIds: string[];
  image: string;
}

export interface Project {
  id: string;
  name: string;
  title: string;
  about: string;
  slug: string;
  researcherIds: string[];
  publicationIds: string[];
  image: string;
}

export interface Publication {
  id: string;
  name: string;
  journal: string;
  abstract: string;
  slug: string;
  publicationUrl: string;
  researcherIds: string[];
  projectIds: string[];
  image: string;
}
