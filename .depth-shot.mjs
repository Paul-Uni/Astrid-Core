// node .depth-shot.mjs <out> <targetDepth>
import { chromium } from "@playwright/test";
const [out, target] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/" + (process.env.Q ?? ""));
await p.waitForSelector("[data-stage=ready]", { timeout: 60000 });
await p.waitForTimeout(2000);
const readDepth = () => p.evaluate(() => { const m = document.body.innerText.match(/depth\s+(\d+)/); return m ? +m[1] : -1; });
let lo = 0, hi = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (let i = 0; i < 18; i++) {
  const mid = (lo + hi) / 2;
  await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), mid);
  await p.waitForTimeout(150);
  (await readDepth()) < +target ? (lo = mid) : (hi = mid);
}
await p.waitForTimeout(1500);
console.log("scrollY", lo, "depth", await readDepth(), "theta", await p.evaluate(() => document.body.innerText.match(/cam\.\d\s+(\d+)/)?.[1]));
await p.screenshot({ path: `${out}/depth-${target}${process.env.TAG ?? ""}.png` });
await b.close();
