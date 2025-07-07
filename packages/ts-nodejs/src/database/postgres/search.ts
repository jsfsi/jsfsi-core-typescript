export const unaccentSearch = (field: string, term: string): string =>
  `unaccent(LOWER(${field})) ILIKE unaccent(LOWER(:${term}))`;
