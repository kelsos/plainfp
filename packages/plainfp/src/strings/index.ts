/**
 * Split a string by a separator. Dual-form: call with both arguments for a
 * direct result, or with just the separator to get a pipe-friendly function.
 */
export function split(s: string, separator: string | RegExp): string[];
export function split(separator: string | RegExp): (s: string) => string[];
export function split(
  sOrSep: string | RegExp,
  separator?: string | RegExp,
): string[] | ((s: string) => string[]) {
  if (separator === undefined) {
    const sep = sOrSep;
    return (s: string) => s.split(sep);
  }
  return (sOrSep as string).split(separator);
}

/** Strip leading and trailing whitespace. */
export const trim = (s: string): string => s.trim();

/**
 * Uppercase the first character, leaving the rest untouched. Empty strings
 * pass through.
 *
 * @example
 *   capitalize("order") // "Order"
 *   capitalize("iPhone") // "IPhone"
 */
export const capitalize = (s: string): string =>
  s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);

/** Lowercase every character. */
export const lowercase = (s: string): string => s.toLowerCase();

/** Uppercase every character. */
export const uppercase = (s: string): string => s.toUpperCase();

/** Check whether the string has zero length. */
export const isEmpty = (s: string): boolean => s.length === 0;

/**
 * Check whether a string begins with a prefix. Dual-form: call with both
 * arguments for a direct result, or with just the prefix for a pipe-friendly
 * predicate.
 */
export function startsWith(s: string, prefix: string): boolean;
export function startsWith(prefix: string): (s: string) => boolean;
export function startsWith(sOrPrefix: string, prefix?: string): boolean | ((s: string) => boolean) {
  if (prefix === undefined) return (s: string) => s.startsWith(sOrPrefix);
  return sOrPrefix.startsWith(prefix);
}

/**
 * Check whether a string ends with a suffix. Dual-form: call with both
 * arguments for a direct result, or with just the suffix for a pipe-friendly
 * predicate.
 */
export function endsWith(s: string, suffix: string): boolean;
export function endsWith(suffix: string): (s: string) => boolean;
export function endsWith(sOrSuffix: string, suffix?: string): boolean | ((s: string) => boolean) {
  if (suffix === undefined) return (s: string) => s.endsWith(sOrSuffix);
  return sOrSuffix.endsWith(suffix);
}

/**
 * Split a string into lines, accepting both `\n` and `\r\n` terminators.
 *
 * @example
 *   lines("name,email\nalice,alice@acme.io\nbob,bob@acme.io")
 *   // ["name,email", "alice,alice@acme.io", "bob,bob@acme.io"]
 */
export const lines = (s: string): string[] => s.split(/\r?\n/);
