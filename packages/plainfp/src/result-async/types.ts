import type { Result } from "../result/types.ts";

/**
 * A `Promise` of a {@link Result}. The async counterpart of `Result<T, E>` —
 * rejection is not used to signal failure; errors live in the resolved `err`
 * branch instead.
 */
export type ResultAsync<T, E> = Promise<Result<T, E>>;
