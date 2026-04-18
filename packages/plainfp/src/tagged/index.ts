/**
 * A readonly object carrying a discriminant `_tag` plus arbitrary data. Any
 * `_tag` field in `Data` is omitted so the stamped tag always wins, matching
 * the runtime guarantee in {@link tag}.
 */
// Omit `_tag` from user data so an incoming `_tag` field can't produce a
// `never` intersection with the stamped tag. Runtime guarantees the stamped
// tag always wins (see spread order below); the type mirrors that.
export type Tagged<Tag extends string, Data extends object = object> = Readonly<
  { readonly _tag: Tag } & Omit<Data, "_tag">
>;

/**
 * Build a constructor for tagged values sharing a fixed `_tag`. The returned
 * function stamps the tag over any user-supplied `_tag`, keeping discriminants
 * trustworthy for {@link hasTag} and switch narrowing.
 *
 * @example
 *   const loading = tag("Loading")
 *   const loaded = tag("Loaded")
 *   type State =
 *     | ReturnType<typeof loading>
 *     | ReturnType<typeof loaded<{ users: User[] }>>
 *
 *   const s: State = loaded({ users: [] })
 *   // { _tag: "Loaded", users: [] }
 */
export const tag = <Tag extends string>(tagName: Tag) => {
  // Spread data FIRST, then _tag, so a user-supplied `_tag` field can never
  // silently hijack the tag and break `hasTag` narrowing.
  const ctor = <Data extends object = object>(data?: Data): Tagged<Tag, Data> => {
    const base = data ?? ({} as Data);
    return { ...base, _tag: tagName } as Tagged<Tag, Data>;
  };
  return ctor;
};

/**
 * Runtime tag check that also narrows the type of `value` to `Tagged<Tag>`.
 *
 * @example
 *   if (hasTag(state, "Loaded")) {
 *     // state is Tagged<"Loaded"> here
 *     render(state)
 *   }
 */
export const hasTag = <Tag extends string>(value: unknown, tagName: Tag): value is Tagged<Tag> =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  (value as { _tag: unknown })._tag === tagName;
