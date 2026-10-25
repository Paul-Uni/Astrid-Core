import { chromium } from "@playwright/test";
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const [w, h, s] of [[1440, 900, 1], [390, 844, 2]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
  await p.goto("http://localhost:3000/");
  await p.waitForSelector("[data-stage=ready]", { timeout: 60000 });
  await p.evaluate(() => document.querySelector('[data-station="4"]').scrollIntoView({ behavior: "instant" }));
  await p.waitForTimeout(1500);
  const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; performance.now() - t0 < 3000 ? requestAnimationFrame(f) : r(n / 3); }; requestAnimationFrame(f); }));
  console.log(w, "fps", fps.toFixed(1));
  await p.close();
}
await b.close();
