import { test, expect } from "@playwright/test";

const EXPECTED = [
  { slug: "about",      theta: "060°", depth: "0740" },
  { slug: "skills",     theta: "120°", depth: "1480" },
  { slug: "projects",   theta: "180°", depth: "2220" },
  { slug: "background", theta: "240°", depth: "2960" },
  { slug: "contact",    theta: "300°", depth: "3700" },
];

test("HUD reads depth 0 at page load (viewport anchored to Entry start)", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(200);
  const hud = page.locator("[role=status]");
  await expect(hud).toContainText("cam.θ 000°");
  await expect(hud).toContainText("depth 0000");
});

for (const { slug, theta, depth } of EXPECTED) {
  test(`HUD lands exactly on ${slug} after rail jump`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: new RegExp(`Jump to station.*${slug}`, "i") }).click();
    await page.waitForTimeout(600);
    const hud = page.locator("[role=status]");
    await expect(hud).toContainText(`cam.θ ${theta}`);
    await expect(hud).toContainText(`depth ${depth}`);
  });
}
