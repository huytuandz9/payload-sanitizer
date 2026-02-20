export type DropPreset =
  | "null"
  | "undefined"
  | "emptyString"
  | "whitespaceString"
  | "dash"
  | "nan";

export const DEFAULT_DROP: DropPreset[] = [
  "undefined",
  "null",
  "emptyString",
  "whitespaceString",
];

export function shouldDropPreset(value: unknown, drop: DropPreset[]): boolean {
  for (const d of drop) {
    switch (d) {
      case "undefined":
        if (value === undefined) return true;
        break;
      case "null":
        if (value === null) return true;
        break;
      case "emptyString":
        if (value === "") return true;
        break;
      case "whitespaceString":
        if (typeof value === "string" && value.trim() === "") return true;
        break;
      case "dash":
        if (value === "-") return true;
        break;
      case "nan":
        if (typeof value === "number" && Number.isNaN(value)) return true;
        break;
    }
  }
  return false;
}
