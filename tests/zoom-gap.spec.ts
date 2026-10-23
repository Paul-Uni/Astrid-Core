import { test } from "@playwright/test";

/** Verify no giant void appears between sections when zooming out. */
test("zoom-out full page screenshots", async ({ page }) => {
  await page.goto("/");
  for (const zoom of [0.5, 0.75, 1, 1.5]) {
    await page.evaluate((z) => {
      document.documentElement.style.fontSize = `${z * 100}%`;
    }, zoom);
    await page.waitForTimeout(100);
    await page.screenshot({
      path: `test-results/zoom-gap-${Math.round(zoom * 100)}.png`,
      fullPage: true,
    });
  }
});
