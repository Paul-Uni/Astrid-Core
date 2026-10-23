import { test } from "@playwright/test";

const SLUGS = ["entry", "about", "skills", "projects", "background", "contact"];

for (const slug of SLUGS) {
  test(`screenshot ${slug}`, async ({ page }) => {
    await page.goto("/");
    // Force an exact scroll to the section top (scrollIntoViewIfNeeded skips
    // the scroll when the element is already partially in view, which was
    // producing bleed-through artefacts in earlier runs).
    await page.evaluate((s) => {
      const el = document.querySelector(`#${s}`) as HTMLElement | null;
      if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" as ScrollBehavior });
    }, slug);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `test-results/station-${slug}.png`, fullPage: false });
  });
}
