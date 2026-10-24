import { test, expect } from "@playwright/test";

/**
 * After a rail jump the viewport shows the station's Figma frame, and no
 * panel sits under the fixed nav bar (≥16px clear of its bottom edge).
 */
for (const slug of ["about", "skills", "projects", "background", "contact"]) {
  test(`rail jump to ${slug}: panels clear the nav`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(`Jump to station.*${slug}`, "i") }).click();
    await page.waitForTimeout(1200);

    const { navBottom, minPanelTop } = await page.evaluate((s) => {
      const nav = document.querySelector("nav[aria-label='Primary']")!.getBoundingClientRect();
      const panels = Array.from(
        document.querySelectorAll<HTMLElement>(`#${s} > div > *`),
      )
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 40 && r.height > 20 && r.width < 1400);
      return { navBottom: nav.bottom, minPanelTop: Math.min(...panels.map((r) => r.top)) };
    }, slug);

    expect(minPanelTop).toBeGreaterThanOrEqual(navBottom + 16);
  });
}
