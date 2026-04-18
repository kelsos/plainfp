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

export const trim = (s: string): string => s.trim();

export const capitalize = (s: string): string =>
  s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);

export const lowercase = (s: string): string => s.toLowerCase();

export const uppercase = (s: string): string => s.toUpperCase();

export const isEmpty = (s: string): boolean => s.length === 0;

export function startsWith(s: string, prefix: string): boolean;
export function startsWith(prefix: string): (s: string) => boolean;
export function startsWith(sOrPrefix: string, prefix?: string): boolean | ((s: string) => boolean) {
  if (prefix === undefined) return (s: string) => s.startsWith(sOrPrefix);
  return sOrPrefix.startsWith(prefix);
}

export function endsWith(s: string, suffix: string): boolean;
export function endsWith(suffix: string): (s: string) => boolean;
export function endsWith(sOrSuffix: string, suffix?: string): boolean | ((s: string) => boolean) {
  if (suffix === undefined) return (s: string) => s.endsWith(sOrSuffix);
  return sOrSuffix.endsWith(suffix);
}

export const lines = (s: string): string[] => s.split(/\r?\n/);
