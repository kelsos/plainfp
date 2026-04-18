import type { Result } from "../result/types.ts";

export type ResultAsync<T, E> = Promise<Result<T, E>>;
