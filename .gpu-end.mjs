import { chromium } from "@playwright/test";
const out = process.argv[2];
const prefix = process.argv[3] || "end";
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(m.type() + ": " + m.text().slice(0, 600)));
await p.goto("http://localhost:3000/");
await p.waitForSelector("[data-stage=ready]");
await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/${prefix}-full.png` });
for (let i = 0; i < 4; i++) {
  await p.screenshot({ path: `${out}/${prefix}-t${i}.png`, clip: { x: 320, y: 380, width: 800, height: 520 } });
  await p.waitForTimeout(700);
}
await p.locator("#contact").getByRole("link", { name: /enter core/i }).hover();
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/${prefix}-hover.png`, clip: { x: 320, y: 380, width: 800, height: 520 } });
console.log(errors.length ? errors.join("\n") : "no console errors");
await b.close();
