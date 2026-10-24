import { test, expect } from "@playwright/test";

/**
 * Verify the actual scrollY after a hash jump matches
 * section.offsetTop - 13rem (= 208px). If scroll-margin-top is NOT being
 * applied, scrollY will equal section.offsetTop exactly.
 */
test("scroll-margin-top is actually applied on hash jumps", async ({ page }) => {
  await page.goto("/");

  // Inspect the computed style of the <section> to prove the rule is live
  const computedMargin = await page.evaluate(() => {
    const el = document.querySelector("#about") as HTMLElement;
    return getComputedStyle(el).scrollMarginTop;
  });
  console.log("computed scroll-margin-top:", computedMargin);
  expect(computedMargin).toBe("208px");

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
  console.log({ scrollY, offsetTop, sectionRectTop, expectedScrollY: offsetTop - 208 });

  // The rule is 13rem = 208px.
  expect(scrollY).toBe(offsetTop - 208);
  expect(Math.round(sectionRectTop)).toBe(208);
});
