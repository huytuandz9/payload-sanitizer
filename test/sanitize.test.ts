import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureDebug,
  createSanitizer,
  resetDebug,
  sanitize,
  sanitizeWith,
} from "../src/index";

afterEach(() => {
  resetDebug();
});

describe("sanitize()", () => {
  it("removes undefined/null/empty strings by default", () => {
    const input = {
      a: "",
      b: "ok",
      c: undefined,
      d: null,
      e: "   ",
      f: 0,
      g: false,
    };

    expect(sanitize(input)).toEqual({ b: "ok", f: 0, g: false });
  });

  it("trims strings by default", () => {
    expect(sanitize({ a: "  hi  " })).toEqual({ a: "hi" });
  });

  it("cleans nested objects", () => {
    const input = { filters: { status: "-", q: "  " }, page: 1 };
    expect(
      sanitize(input, {
        drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
      }),
    ).toEqual({ filters: {}, page: 1 });
  });

  it("cleans arrays", () => {
    const input = { tags: ["a", "", "  ", "-", "b"] };
    expect(
      sanitize(input, {
        drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
      }),
    ).toEqual({ tags: ["a", "b"] });
  });

  it("supports keepKeys", () => {
    const input = { status: "-", q: "" };
    expect(
      sanitize(input, {
        drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
        keepKeys: ["status"],
      }),
    ).toEqual({ status: "-" });
  });

  it("supports dropKeys", () => {
    const input = { password: "secret", q: "ok" };
    expect(sanitize(input, { dropKeys: ["password"] })).toEqual({ q: "ok" });
  });

  it("supports keepPaths", () => {
    const input = { filters: { status: "-", q: "" } };

    const out = sanitize(input, {
      drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
      keepPaths: ["filters.status"],
      dropEmptyObjects: true,
    });

    expect(out).toEqual({ filters: { status: "-" } });
  });

  it("supports dropPaths", () => {
    const input = { meta: { debug: true }, q: "ok" };

    const out = sanitize(input, {
      dropPaths: ["meta.debug"],
      dropEmptyObjects: true,
    });

    expect(out).toEqual({ q: "ok" });
  });

  it("drops empty objects when enabled", () => {
    const input = { filters: { status: "-", q: " " }, page: 1 };
    const out = sanitize(input, {
      drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
      dropEmptyObjects: true,
    });

    expect(out).toEqual({ page: 1 });
  });

  it("drops empty arrays when enabled", () => {
    const input = { tags: ["", " ", "-"] };
    const out = sanitize(input, {
      drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
      dropEmptyArrays: true,
    });

    expect(out).toEqual({});
  });

  it("keeps backward compatibility for sanitize.with", () => {
    const sanitizeSearch = sanitize.with({
      drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
    });

    expect(sanitizeSearch({ q: "  hi ", status: "-" })).toEqual({ q: "hi" });
  });

  it("supports createSanitizer and sanitizeWith", () => {
    const one = createSanitizer({ drop: ["undefined", "null", "emptyString"] });
    const two = sanitizeWith({ drop: ["undefined", "null", "emptyString"] });

    expect(one({ a: "", b: 1 })).toEqual({ b: 1 });
    expect(two({ a: "", b: 2 })).toEqual({ b: 2 });
  });

  it("supports instance debug logger", () => {
    const logger = vi.fn();
    sanitize({ a: " " }, { debug: true, logger });
    expect(logger).toHaveBeenCalled();
  });

  it("supports global debug logger", () => {
    const logger = vi.fn();
    configureDebug({ debug: true, logger });
    sanitize({ a: " " });
    expect(logger).toHaveBeenCalled();
  });

  it("supports strict option validation", () => {
    expect(() =>
      sanitize({ a: 1 }, { strict: true, drop: "bad" as unknown as never[] }),
    ).toThrow("`drop` must be an array");
  });

  it("does not crash on circular references", () => {
    const a: Record<string, unknown> = { name: "root", empty: " " };
    const b: Record<string, unknown> = { parent: a };
    a.child = b;

    const out = sanitize(a);
    expect(out).toBeDefined();
    expect((out as Record<string, unknown>).empty).toBeUndefined();
  });
});
