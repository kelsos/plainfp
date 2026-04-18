import type { z } from "zod";
import { err, ok } from "../../result/constructors.ts";
import type { Result } from "../../result/types.ts";

export const fromZod =
  <S extends z.ZodTypeAny>(schema: S): ((input: unknown) => Result<z.infer<S>, z.ZodError>) =>
  (input) => {
    // Zod throws synchronously from `safeParse` when the schema contains
    // async refinements/transforms. Rethrow with a clear pointer to
    // `fromZodAsync` so consumers get an actionable error rather than a
    // bare ZodError-less exception leaking up.
    try {
      const parsed = schema.safeParse(input);
      return parsed.success ? ok(parsed.data) : err(parsed.error);
    } catch (cause) {
      throw new Error(
        "fromZod cannot parse schemas with async refinements or transforms; use fromZodAsync.",
        { cause },
      );
    }
  };

export const fromZodAsync =
  <S extends z.ZodTypeAny>(
    schema: S,
  ): ((input: unknown) => Promise<Result<z.infer<S>, z.ZodError>>) =>
  async (input) => {
    const parsed = await schema.safeParseAsync(input);
    return parsed.success ? ok(parsed.data) : err(parsed.error);
  };
