import { chromium } from "@playwright/test";
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await p.goto("http://localhost:3000/#contact");
await p.waitForSelector("[data-stage=ready]");
await p.waitForTimeout(2000);
await p.screenshot({ path: process.argv[2] });
await b.close();
