import { expect, test } from "vite-plus/test";
import { hasTag, tag } from "./index.ts";

const NetworkError = tag("NetworkError");
const ValidationError = tag("ValidationError");

test("tag creates a constructor that stamps _tag", () => {
  const e = NetworkError({ url: "/users", status: 503 });
  expect(e._tag).toBe("NetworkError");
  expect(e.url).toBe("/users");
  expect(e.status).toBe(503);
});

test("tag constructor works with no data", () => {
  const e = NetworkError();
  expect(e).toEqual({ _tag: "NetworkError" });
});

test("hasTag narrows by tag name", () => {
  const e: unknown = ValidationError({ field: "email" });
  expect(hasTag(e, "ValidationError")).toBe(true);
  expect(hasTag(e, "NetworkError")).toBe(false);
});

test("hasTag returns false for non-tagged values", () => {
  expect(hasTag({ msg: "oops" }, "NetworkError")).toBe(false);
  expect(hasTag(null, "NetworkError")).toBe(false);
  expect(hasTag("string", "NetworkError")).toBe(false);
});
