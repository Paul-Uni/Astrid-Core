import { test } from "@playwright/test";

const SLUGS = ["entry", "about", "skills", "projects", "background", "contact"];

for (const slug of SLUGS) {
  test(`screenshot ${slug}`, async ({ page }) => {
    await page.goto("/");
    if (slug === "entry") {
      // No jump — screenshot the initial viewport (what the user sees on load).
    } else {
      // Click the rail link so we honour the real scroll-margin-top landing
      // (what the user actually sees after clicking a rail/nav link).
      await page.getByRole("link", { name: new RegExp(`Jump to station.*${slug}`, "i") }).click();
      await page.waitForTimeout(700);     // smooth-scroll settle
    }
    await page.screenshot({ path: `test-results/station-${slug}.png`, fullPage: false });
  });
}
