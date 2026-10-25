import { chromium } from "@playwright/test";
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/");
await p.waitForSelector("[data-stage=ready]");
await p.evaluate(() => document.querySelector('[data-station="4"]').scrollIntoView({ behavior: "instant" }));
await p.waitForTimeout(1500);
await p.evaluate(() => {
  window.__trace = [];
  const el = document.querySelector('[data-orbit-node="github"]');
  const tick = () => { const r = el.getBoundingClientRect(); window.__trace.push([scrollY, r.left, r.top, el.style.visibility]); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
for (let i = 0; i < 40; i++) { await p.mouse.wheel(0, 30); await p.waitForTimeout(16); }
await p.waitForTimeout(800);
const t = await p.evaluate(() => window.__trace);
// Jumps: frame-to-frame change in x that reverses direction sharply.
let rev = 0, maxd2 = 0;
const vis = t.filter((r) => r[3] === "visible");
for (let i = 2; i < vis.length; i++) {
  const d1 = vis[i - 1][1] - vis[i - 2][1], d2 = vis[i][1] - vis[i - 1][1];
  if (d1 * d2 < 0 && Math.abs(d1) > 1 && Math.abs(d2) > 1) rev++;
  maxd2 = Math.max(maxd2, Math.abs(d2 - d1));
}
console.log("frames", t.length, "visible", vis.length, "direction reversals", rev, "max accel px", maxd2.toFixed(1));
console.log(vis.map((r) => r.slice(0, 3).map((v) => Math.round(v)).join(",")).join(" | "));
await b.close();
