export function siteKeyFromId(entryId: string): string {
  const slash = entryId.indexOf('/');
  return slash === -1 ? entryId : entryId.slice(0, slash);
}
