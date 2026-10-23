import { test, expect } from "@playwright/test";

/**
 * Phase A verification: shell renders, chrome visible,
 * CTRL+zoom contract holds at 100 / 150 / 200%.
 */

const STATIONS = ["entry", "about", "skills", "projects", "background", "contact"];

test.describe("Phase A — shell", () => {
  test("renders chrome + 6 sections + sky gradient", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Astrid-Core home")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByLabel("Orbit rail — section navigator")).toBeVisible();
    await expect(page.getByText("SCROLL TO ORBIT")).toBeVisible();
    for (const slug of STATIONS) {
      await expect(page.locator(`#${slug}`)).toBeAttached();
    }
    await page.screenshot({ path: "test-results/phase-a-top.png", fullPage: false });
  });

  test("CTRL+zoom emulation: 100 / 150 / 200% — chrome stays laid out", async ({ page }) => {
    await page.goto("/");
    for (const zoom of [1, 1.5, 2]) {
      await page.evaluate((z) => {
        document.documentElement.style.fontSize = `${z * 100}%`;
      }, zoom);
      // No horizontal overflow allowed at any zoom
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientW = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollW).toBeLessThanOrEqual(clientW + 1);
      await page.screenshot({ path: `test-results/phase-a-zoom-${zoom * 100}.png`, fullPage: false });
    }
  });

  test("HUD counts on scroll", async ({ page }) => {
    await page.goto("/");
    const hud = page.locator("[role=status]");
    await expect(hud).toContainText("cam.θ 000°");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: "instant" as ScrollBehavior }));
    await page.waitForTimeout(100);
    await expect(hud).not.toContainText("cam.θ 000°");
  });
});
