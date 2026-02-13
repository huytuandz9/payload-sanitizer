import { defineConfig } from "vitepress";

export default defineConfig({
  title: "payload-sanitizer",
  description: "Tiny zero-dependency payload sanitizer for JS/TS (frontend + backend).",
  base: "/payload-sanitizer/",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "npm", link: "https://www.npmjs.com/package/payload-sanitizer" },
    ],
    sidebar: [
      { text: "Guide", items: [{ text: "Getting Started", link: "/" }] },
    ],
  },
});
