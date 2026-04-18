import { expect, test } from "vite-plus/test";
import { hasTag, tag } from "./index.ts";

const NetworkError = tag("NetworkError");

test("user data cannot hijack _tag via a colliding field", () => {
  // Simulates forwarding attacker-controlled payload into an error constructor.
  const malicious = { _tag: "AdminBypass" as const, url: "/api" };
  const e = NetworkError(malicious);
  expect(e._tag).toBe("NetworkError");
  expect(hasTag(e, "NetworkError")).toBe(true);
  expect(hasTag(e, "AdminBypass")).toBe(false);
});
