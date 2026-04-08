export const queryKeys = {
  trees: ["trees"] as const,
  personsByTree: (treeId: number) => ["persons", "tree", treeId] as const,
  person: (personId: number) => ["persons", "detail", personId] as const,
  graphPath: (treeId: number, fromPersonId: number, toPersonId: number) =>
    ["graph", "path", treeId, fromPersonId, toPersonId] as const,
  kinship: (treeId: number, fromPersonId: number, toPersonId: number) =>
    ["kinship", treeId, fromPersonId, toPersonId] as const
};
