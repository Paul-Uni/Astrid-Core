import { test, expect } from "@playwright/test";

test("rail jump leaves nav-clearance for section top", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Jump to station.*about/i }).click();
  await page.waitForTimeout(500);

  const sectionTop = await page.evaluate(() => {
    const el = document.querySelector("#about") as HTMLElement;
    return el.getBoundingClientRect().top;
  });

  // 10rem = 160px nominal — section should start at or below that line.
  expect(sectionTop).toBeGreaterThanOrEqual(150);

  await page.screenshot({ path: "test-results/nav-clearance-about.png", fullPage: false });
});
