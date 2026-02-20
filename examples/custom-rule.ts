import { sanitize } from "payload-sanitizer";

const payload = {
  q: "  noise  ",
  filters: {
    status: "-",
    range: { from: " ", to: " " },
  },
};

const cleaned = sanitize(payload, {
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
  dropEmptyObjects: true,
  shouldDrop: (value, path) =>
    path.at(-1) === "range" &&
    typeof value === "object" &&
    value !== null &&
    Object.keys(value as Record<string, unknown>).length === 0,
});

console.log(cleaned);
