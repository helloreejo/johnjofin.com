/* Pixel-diff the original static page against the Next build, section by
   section, at desktop and mobile widths.

   The text check proves nothing was lost; this proves nothing moved. Diff
   images for anything over threshold are written to scripts/verify/diff/.

   One full-page capture per page, then cropped locally — element screenshots
   scroll each target into view, which fights Lenis and hangs the CDP call.

   node scripts/verify/visual-parity.mjs [originalUrl] [nextUrl]
*/
import puppeteer from "puppeteer-core";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";

const ORIG = process.argv[2] || "http://localhost:8777/index.html";
const NEXT = process.argv[3] || "http://localhost:8778/";
const OUT = "scripts/verify/diff";

/* every section, plus the footer which sits outside <main> */
const TARGETS = [
  "#top",
  '[aria-label="At a glance"]',
  "#about",
  "#dimensions",
  "#faith",
  "#spiritual",
  "#journey",
  "#expertise",
  "#credentials",
  "#certifications",
  "#references",
  "#beyond",
  "#contact",
  "footer",
];

const WIDTHS = [1440, 390];
/* a few pixels differ from subpixel text rasterisation between two
   independently-rendered pages; anything structural is far larger */
const TOLERANCE = 0.002; /* 0.2% of pixels */

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--disable-gpu", "--force-device-scale-factor=1"],
  protocolTimeout: 180000,
});

async function capture(url, width) {
  const p = await browser.newPage();
  await p.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
  await p.goto(url, { waitUntil: "networkidle0" });

  /* freeze the page: reveals, the carousel and parallax all move, and a
     moving page cannot be compared against another moving page */
  await p.evaluate(() => {
    document
      .querySelectorAll(".reveal, .tl-item, .hero-step")
      .forEach((el) => el.classList.add("is-in"));
    const kill = document.createElement("style");
    kill.textContent = `*,*::before,*::after{
      animation:none!important;
      transition:none!important}
      .hero-img{opacity:1!important}
      /* the parallax layer is mid-transform at whatever scroll we stopped at */
      .plx{transform:none!important}`;
    document.head.appendChild(kill);
  });
  await new Promise((r) => setTimeout(r, 900));

  /* geometry first, in page coordinates */
  const boxes = await p.evaluate((sels) => {
    const out = {};
    for (const s of sels) {
      const el = document.querySelector(s);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      out[s] = {
        x: Math.round(r.left + window.scrollX),
        y: Math.round(r.top + window.scrollY),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    }
    return out;
  }, TARGETS);

  const png = PNG.sync.read(
    Buffer.from(await p.screenshot({ fullPage: true, type: "png" })),
  );
  await p.close();
  return { png, boxes };
}

function crop(png, box) {
  const w = Math.min(box.width, png.width - box.x);
  const h = Math.min(box.height, png.height - box.y);
  if (w < 2 || h < 2) return null;
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(png, out, box.x, box.y, w, h, 0, 0);
  return out;
}

let failures = 0;
const rows = [];

for (const width of WIDTHS) {
  const [A, B] = await Promise.all([
    capture(ORIG, width),
    capture(NEXT, width),
  ]);

  for (const sel of TARGETS) {
    const name = `${width}-${sel.replace(/[^a-z0-9]/gi, "") || "root"}`;
    const ba = A.boxes[sel];
    const bb = B.boxes[sel];

    if (!ba || !bb) {
      rows.push([
        name,
        "MISSING",
        !ba ? "absent in original" : "absent in next",
      ]);
      failures++;
      continue;
    }
    if (ba.width !== bb.width || ba.height !== bb.height) {
      rows.push([
        name,
        "SIZE",
        `${ba.width}×${ba.height} vs ${bb.width}×${bb.height}`,
      ]);
      failures++;
      continue;
    }

    const ia = crop(A.png, ba);
    const ib = crop(B.png, bb);
    if (!ia || !ib) {
      rows.push([name, "EMPTY", ""]);
      failures++;
      continue;
    }

    const h = Math.min(ia.height, ib.height);
    const diff = new PNG({ width: ia.width, height: h });
    const n = pixelmatch(ia.data, ib.data, diff.data, ia.width, h, {
      threshold: 0.1,
    });
    const ratio = n / (ia.width * h);
    const ok = ratio <= TOLERANCE;
    if (!ok) {
      writeFileSync(`${OUT}/${name}-diff.png`, PNG.sync.write(diff));
      writeFileSync(`${OUT}/${name}-original.png`, PNG.sync.write(ia));
      writeFileSync(`${OUT}/${name}-next.png`, PNG.sync.write(ib));
      failures++;
    }
    rows.push([
      name,
      ok ? "ok" : "DIFF",
      `${n} px  ${(ratio * 100).toFixed(3)}%  (${ia.width}×${h})`,
    ]);
  }
}

await browser.close();

for (const [name, status, detail] of rows) {
  console.log(
    `${status === "ok" ? "  ok " : "FAIL "}${name.padEnd(30)} ${detail}`,
  );
}
console.log(
  failures
    ? `\n${failures} section(s) differ — see ${OUT}/`
    : "\nvisually identical",
);
process.exit(failures ? 1 : 0);
