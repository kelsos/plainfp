import type { z } from "zod";
import { err, ok } from "../../result/constructors.ts";
import type { Result } from "../../result/types.ts";

/**
 * Build a parser that validates `input` against a Zod schema and returns a
 * {@link Result}. Throws a wrapped `Error` (with the original as `cause`)
 * if the schema uses async refinements or transforms — use
 * {@link fromZodAsync} for those.
 *
 * @example
 *   const User = z.object({ id: z.string(), age: z.number() })
 *   const parseUser = fromZod(User)
 *   const r = parseUser(JSON.parse(body))
 *   if (r.ok) save(r.value)
 *   else console.error(r.error.issues)
 */
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

/**
 * Async variant of {@link fromZod}: validates via `safeParseAsync`, so
 * schemas with async refinements or transforms are supported.
 *
 * @example
 *   const Signup = z.object({
 *     email: z.string().email().refine(isEmailAvailable),
 *   })
 *   const parseSignup = fromZodAsync(Signup)
 *   const r = await parseSignup(formData)
 *   if (r.ok) createAccount(r.value)
 */
export const fromZodAsync =
  <S extends z.ZodTypeAny>(
    schema: S,
  ): ((input: unknown) => Promise<Result<z.infer<S>, z.ZodError>>) =>
  async (input) => {
    const parsed = await schema.safeParseAsync(input);
    return parsed.success ? ok(parsed.data) : err(parsed.error);
  };
