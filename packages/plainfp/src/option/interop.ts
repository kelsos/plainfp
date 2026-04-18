import { err, ok } from "../result/constructors.ts";
import type { Result } from "../result/types.ts";
import type { Option } from "./types.ts";

/**
 * Convert an {@link Option} into a {@link Result}: `some(v)` becomes `ok(v)`
 * and `none` becomes `err(errorForNone)`. The inverse of `Result.toOption`.
 *
 * Dual API — works data-first or curried for use in `pipe`.
 *
 * @example
 *   pipe(
 *     findUser(id),
 *     Option.toResult({ code: "USER_NOT_FOUND", id }),
 *     Result.flatMap(loadOrders),
 *   )
 */
export function toResult<T, E>(option: Option<T>, errorForNone: E): Result<T, E>;
export function toResult<E>(errorForNone: E): <T>(option: Option<T>) => Result<T, E>;
export function toResult<T, E>(
  optionOrError: Option<T> | E,
  errorForNone?: E,
): Result<T, E> | ((option: Option<T>) => Result<T, E>) {
  // arguments.length discriminates data-first vs curried so a runtime
  // Option-shaped `errorForNone` in data-first calls can't be misread.
  if (arguments.length < 2) {
    const e = optionOrError as E;
    return (option: Option<T>) => (option.some ? ok(option.value) : err(e));
  }
  const option = optionOrError as Option<T>;
  return option.some ? ok(option.value) : err(errorForNone as E);
}
