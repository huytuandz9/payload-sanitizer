import { describe, expect, it } from "vitest";
import { compact, diff, isEmpty, omit, pick, safeParse } from "../src/index";

describe("utils", () => {
  it("pick() returns only selected keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("omit() removes selected keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });

  it("isEmpty() handles arrays and objects", () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty([1])).toBe(false);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty("")).toBe(false);
  });

  it("compact() removes falsy values", () => {
    expect(compact([0, 1, false, 2, "", 3, null, undefined] as const)).toEqual([
      1,
      2,
      3,
    ]);
  });

  it("safeParse() returns parsed value or fallback", () => {
    expect(safeParse<{ a: number }>("{\"a\":1}")).toEqual({ a: 1 });
    expect(safeParse("bad", { a: 1 })).toEqual({ a: 1 });
    expect(safeParse("bad")).toBeUndefined();
  });

  it("diff() reports added, removed, and changed entries", () => {
    expect(diff({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({
      added: { c: 4 },
      removed: { a: 1 },
      changed: { b: { from: 2, to: 3 } },
    });
  });
});
