// node .glare-sweep.mjs  — counts near-white pixels in the central column across the whole scroll range.
import { chromium } from "@playwright/test";
import sharp from "sharp";
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/" + (process.env.Q ?? ""));
await p.waitForSelector("[data-stage=ready]", { timeout: 60000 });
await p.waitForTimeout(2000);
const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const rows = [];
for (let y = 0; y <= max; y += 120) {
  await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
  await p.waitForTimeout(220);
  const buf = await p.screenshot();
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let hot = 0;
  for (let i = 0; i < data.length; i += 3) if (data[i] > 240 && data[i + 1] > 225 && data[i + 2] > 235) hot++;
  const depth = await p.evaluate(() => document.body.innerText.match(/depth\s+(\d+)/)?.[1]);
  rows.push([y, depth, hot]);
}
console.log(rows.map((r) => r.join("\t")).join("\n"));
await b.close();
