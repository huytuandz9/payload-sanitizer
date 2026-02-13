import { describe, expect, it } from "vitest";
import { sanitize } from "../src/index";

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
      sanitize(input, { drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"] }),
    ).toEqual({ filters: {}, page: 1 });
  });

  it("cleans arrays", () => {
    const input = { tags: ["a", "", "  ", "-", "b"] };
    expect(
      sanitize(input, { drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"] }),
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
});
