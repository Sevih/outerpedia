/** Concatène des classes conditionnelles (valeurs falsy ignorées). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
