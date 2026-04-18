import { none, some } from "../option/constructors.ts";
import type { Option } from "../option/types.ts";
import type { Result } from "./types.ts";

/**
 * Convert a {@link Result} into an {@link Option}: `ok(v)` becomes `some(v)`
 * and `err(_)` becomes {@link none} — the error is discarded. The inverse of
 * `Option.toResult`.
 *
 * @example
 *   pipe(
 *     parseUser(body),
 *     Result.toOption, // drop the parse error, keep just the user if any
 *     Option.map(u => u.name),
 *   )
 */
export const toOption = <T, E>(result: Result<T, E>): Option<T> =>
  result.ok ? some(result.value) : none;
