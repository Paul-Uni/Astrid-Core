// Usage: node stations.mjs <outDir> <prefix>  — screenshots stations 00, 04, 05 (desktop + mobile).
import { chromium } from "@playwright/test";
const [out, prefix = "shot"] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
for (const [tag, vp] of [["desk", { width: 1440, height: 900 }], ["mob", { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: tag === "mob" ? 2 : 1 });
  await p.goto("http://localhost:3000/");
  await p.waitForSelector("[data-stage=ready]", { timeout: 60000 });
  await p.waitForTimeout(2500);
  for (const id of (process.env.IDS ?? "0,3,4,5").split(",")) {
    await p.evaluate((id) => {
      if (id === "5") return window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      document.querySelector(`[data-station="${id}"]`).scrollIntoView({ behavior: "instant" });
    }, id);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${out}/${prefix}-${tag}-0${id}.png` });
  }
  await p.close();
}
await b.close();
