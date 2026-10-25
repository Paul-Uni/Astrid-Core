import { chromium } from "@playwright/test";
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/");
await p.waitForSelector("[data-stage=ready]");
console.log(await p.evaluate(() => {
  const out = [];
  let el = document.querySelector('[data-orbit-node="github"]');
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    out.push(`${el.tagName}.${(el.className||"").toString().slice(0,40)} pos=${cs.position} tf=${cs.transform} filt=${cs.filter} bf=${cs.backdropFilter} wc=${cs.willChange} contain=${cs.contain}`);
    el = el.parentElement;
  }
  return out.join("\n");
}));
await b.close();
