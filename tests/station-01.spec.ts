import { test } from "@playwright/test";

test("Station 01 About screenshot", async ({ page }) => {
  await page.goto("/");
  await page.locator("#about").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "test-results/station-01-about.png", fullPage: false });
});
