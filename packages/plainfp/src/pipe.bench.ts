import { bench, describe } from "vite-plus/test";
import { pipe } from "./pipe.ts";

const add1 = (n: number) => n + 1;
const mul2 = (n: number) => n * 2;
const sub3 = (n: number) => n - 3;
const div4 = (n: number) => n / 4;

describe("pipe vs manual chaining", () => {
  bench("pipe(x, f, g, h, i)", () => {
    pipe(10, add1, mul2, sub3, div4);
  });
  bench("manual: i(h(g(f(x))))", () => {
    div4(sub3(mul2(add1(10))));
  });
  bench("manual: chained const", () => {
    const a = add1(10);
    const b = mul2(a);
    const c = sub3(b);
    div4(c);
  });
});
