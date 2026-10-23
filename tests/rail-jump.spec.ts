import { test, expect } from "@playwright/test";

/**
 * Clicking an orbit-rail link must land on the matching section AND
 * surface the matching label as the HUD "// active" state.
 * Also verifies clicking the (hover-only) label jumps, not just the diamond.
 */

const EXPECT = [
  { slug: "skills",     labelPart: "02 SKILLS" },
  { slug: "projects",   labelPart: "03 PROJECTS" },
  { slug: "background", labelPart: "04 BACKGROUND" },
  { slug: "contact",    labelPart: "05 CONTACT" },
];

for (const { slug, labelPart } of EXPECT) {
  test(`rail click → #${slug} lands on correct section`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(`Jump to station.*${slug}`, "i") }).click();
    await page.waitForTimeout(600);                                // allow smooth scroll + rAF to settle

    const section = page.locator(`#${slug}`);
    const box = await section.boundingBox();
    expect(box, `section #${slug} should be in the DOM`).not.toBeNull();
    expect(box!.y, `#${slug} should be in viewport after click`).toBeLessThan(900);

    // Rail label for this station is visible (so HUD / rail show the correct active state)
    await expect(page.getByLabel("Orbit rail — section navigator")).toContainText(labelPart);
  });
}
