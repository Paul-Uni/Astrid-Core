import { chromium } from "@playwright/test";
const dir = process.argv[2];
const b = await chromium.launch({ args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("console", (m) => m.type() === "error" && console.log(m.text()));
for (const v of ["a", "b", "c"]) {
  for (const h of ["", "&hover"]) {
    await p.goto(`file:///${dir}/index.html?v=${v}&t=1.2${h}`);
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${dir}/lock-${v}${h ? "-hover" : ""}.png`, clip: { x: 370, y: 330, width: 700, height: 570 } });
  }
}
await b.close();
