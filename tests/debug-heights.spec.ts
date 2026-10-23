import { test } from "@playwright/test";

test("inspect section heights + content positions", async ({ page }) => {
  await page.goto("/");
  const info = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-station]"));
    return sections.map((s) => {
      const rect = s.getBoundingClientRect();
      const children = Array.from(s.querySelectorAll<HTMLElement>(":scope > div > *"));
      return {
        slug: s.id,
        offsetTop: s.offsetTop,
        offsetHeight: s.offsetHeight,
        rectTop: rect.top,
        rectHeight: rect.height,
        childrenCount: children.length,
        childrenRects: children.map((c) => ({
          cls: c.className.slice(0, 60),
          top: c.offsetTop,
          height: c.offsetHeight,
        })),
      };
    });
  });
  console.log(JSON.stringify(info, null, 2));
});
