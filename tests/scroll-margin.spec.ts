import { test, expect } from "@playwright/test";

/**
 * Each section is a full 900px Figma frame, so a hash jump must land with
 * the section top exactly at the viewport top (scroll-margin-top: 0).
 */
test("hash jumps land exactly on the section top", async ({ page }) => {
  await page.goto("/");

  // Inspect the computed style of the <section> to prove the rule is live
  const computedMargin = await page.evaluate(() => {
    const el = document.querySelector("#about") as HTMLElement;
    return getComputedStyle(el).scrollMarginTop;
  });
  console.log("computed scroll-margin-top:", computedMargin);
  expect(computedMargin).toBe("0px");

  // Click rail link, let smooth-scroll settle, then compare scrollY to offsetTop
  await page.getByRole("link", { name: /Jump to station.*about/i }).click();
  await page.waitForTimeout(800);

  const { scrollY, offsetTop, sectionRectTop } = await page.evaluate(() => {
    const el = document.querySelector("#about") as HTMLElement;
    return {
      scrollY: window.scrollY,
      offsetTop: el.offsetTop,
      sectionRectTop: el.getBoundingClientRect().top,
    };
  });
  console.log({ scrollY, offsetTop, sectionRectTop, expectedScrollY: offsetTop });

  expect(scrollY).toBe(offsetTop);
  expect(Math.round(sectionRectTop)).toBe(0);
});
