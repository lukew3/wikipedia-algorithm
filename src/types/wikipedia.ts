// Only raw API types not covered by the `wikipedia` npm package

export interface WikiCategoryMembersResponse {
  query: {
    categorymembers: Array<{ ns: number; title: string; pageid: number }>
  }
}
