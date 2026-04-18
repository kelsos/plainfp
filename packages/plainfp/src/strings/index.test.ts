import { expect, test } from "vite-plus/test";
import { pipe } from "../pipe.ts";
import {
  capitalize,
  endsWith,
  isEmpty,
  lines,
  lowercase,
  split,
  startsWith,
  trim,
  uppercase,
} from "./index.ts";

test("split divides by separator", () => {
  expect(split("a,b,c", ",")).toEqual(["a", "b", "c"]);
});

test("split is pipe-able", () => {
  expect(pipe("a-b-c", split("-"))).toEqual(["a", "b", "c"]);
});

test("trim removes surrounding whitespace", () => {
  expect(trim("  hi  ")).toBe("hi");
});

test("capitalize uppercases first character", () => {
  expect(capitalize("hello")).toBe("Hello");
  expect(capitalize("")).toBe("");
});

test("lowercase and uppercase transform case", () => {
  expect(lowercase("HI")).toBe("hi");
  expect(uppercase("hi")).toBe("HI");
});

test("isEmpty checks empty string", () => {
  expect(isEmpty("")).toBe(true);
  expect(isEmpty("x")).toBe(false);
});

test("startsWith / endsWith are pipe-able", () => {
  expect(pipe("hello world", startsWith("hello"))).toBe(true);
  expect(pipe("hello world", endsWith("world"))).toBe(true);
});

test("lines splits on both \\n and \\r\\n", () => {
  expect(lines("a\nb\r\nc")).toEqual(["a", "b", "c"]);
});
