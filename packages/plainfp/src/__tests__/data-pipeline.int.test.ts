import { expect, test } from "vite-plus/test";
import { sumBy } from "../arrays/aggregate.ts";
import { groupBy } from "../arrays/group.ts";
import { filter, map } from "../arrays/transform.ts";
import { countBy } from "../arrays/aggregate.ts";
import { uniqueBy } from "../arrays/unique.ts";
import { pipe } from "../pipe.ts";
import { mapValues } from "../records/transform.ts";

// Integration: the canonical data-shaping pipeline from the README —
// Arrays.groupBy → Records.mapValues → Arrays.sumBy. Plus a couple of
// extended variants that cross the Arrays/Records boundary.

type Order = {
  id: string;
  customerId: string;
  status: "paid" | "pending" | "cancelled";
  amount: number;
};

const orders: Order[] = [
  { id: "o1", customerId: "c1", status: "paid", amount: 100 },
  { id: "o2", customerId: "c1", status: "paid", amount: 50 },
  { id: "o3", customerId: "c1", status: "cancelled", amount: 999 },
  { id: "o4", customerId: "c2", status: "paid", amount: 200 },
  { id: "o5", customerId: "c2", status: "pending", amount: 75 },
  { id: "o6", customerId: "c3", status: "paid", amount: 10 },
];

test("totals-by-customer: the README's headline Arrays + Records example", () => {
  const totalsByCustomer = pipe(
    orders,
    filter((o) => o.status === "paid"),
    groupBy((o) => o.customerId),
    mapValues((os) => sumBy(os, (o) => o.amount)),
  );
  expect(totalsByCustomer).toEqual({
    c1: 150,
    c2: 200,
    c3: 10,
  });
});

test("order-count-by-status across all orders", () => {
  const byStatus = pipe(
    orders,
    countBy((o) => o.status),
  );
  expect(byStatus).toEqual({ paid: 4, pending: 1, cancelled: 1 });
});

test("unique customers who have at least one paid order (dedup across pipeline)", () => {
  const customers = pipe(
    orders,
    filter((o) => o.status === "paid"),
    uniqueBy((o) => o.customerId),
    map((o) => o.customerId),
  );
  expect(customers.sort()).toEqual(["c1", "c2", "c3"]);
});

test("multi-step transform: paid order amounts sorted per customer", () => {
  const amountsByCustomer = pipe(
    orders,
    filter((o) => o.status === "paid"),
    groupBy((o) => o.customerId),
    mapValues((os) => map(os, (o) => o.amount).sort((a, b) => a - b)),
  );
  expect(amountsByCustomer).toEqual({
    c1: [50, 100],
    c2: [200],
    c3: [10],
  });
});

test("empty-input robustness: pipeline returns the empty shape, not undefined", () => {
  const result = pipe(
    [] as Order[],
    filter((o) => o.status === "paid"),
    groupBy((o) => o.customerId),
    mapValues((os) => sumBy(os, (o) => o.amount)),
  );
  expect(result).toEqual({});
});
