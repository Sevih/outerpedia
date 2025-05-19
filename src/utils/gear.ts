export function normalizeClass(input: string | string[] | null | undefined): string[] {
  if (!input) return [];
  return Array.isArray(input) ? input : [input];
}
