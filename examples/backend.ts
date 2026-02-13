import { sanitize } from "payload-sanitizer";

// Pretend this came from req.query / req.body
const raw = {
  q: "  iphone  ",
  status: "",
  tags: ["", "hot", " ", "-"],
  filters: { brand: "  ", priceMin: null },
};

const clean = sanitize(raw, {
  drop: ["undefined", "null", "emptyString", "whitespaceString", "dash"],
  dropEmptyObjects: true,
  dropEmptyArrays: true,
});

console.log(clean);
// { q: "iphone", tags: ["hot"] }
