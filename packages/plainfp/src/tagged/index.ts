// Omit `_tag` from user data so an incoming `_tag` field can't produce a
// `never` intersection with the stamped tag. Runtime guarantees the stamped
// tag always wins (see spread order below); the type mirrors that.
export type Tagged<Tag extends string, Data extends object = object> = Readonly<
  { readonly _tag: Tag } & Omit<Data, "_tag">
>;

export const tag = <Tag extends string>(tagName: Tag) => {
  // Spread data FIRST, then _tag, so a user-supplied `_tag` field can never
  // silently hijack the tag and break `hasTag` narrowing.
  const ctor = <Data extends object = object>(data?: Data): Tagged<Tag, Data> => {
    const base = data ?? ({} as Data);
    return { ...base, _tag: tagName } as Tagged<Tag, Data>;
  };
  return ctor;
};

export const hasTag = <Tag extends string>(value: unknown, tagName: Tag): value is Tagged<Tag> =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  (value as { _tag: unknown })._tag === tagName;
