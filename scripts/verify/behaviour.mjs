/* Behavioural checks on the Next build: the carousel, Lenis anchors, the
   header's solid-state hysteresis and the mobile menu.

   These are the same assertions the static site was held to, so a regression
   in the port shows up as a changed number rather than a vague "feels off".

   node scripts/verify/behaviour.mjs [url]
*/
import puppeteer from "puppeteer-core";

const URL = process.argv[2] || "http://localhost:8778/";

const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--disable-gpu"],
});

let failed = 0;
const check = (label, got, want) => {
  const ok = String(got) === String(want);
  if (!ok) failed++;
  console.log(
    `${ok ? "  ok " : "FAIL "}${label.padEnd(34)} ${got}${ok ? "" : `   (want ${want})`}`,
  );
};

async function page({ reduced = false, width = 1440 } = {}) {
  const p = await browser.newPage();
  await p.setViewport({ width, height: 900 });
  if (reduced)
    await p.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto(URL, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 900));
  return { p, errors };
}

/* ---------- carousel ---------- */
for (const reduced of [false, true]) {
  const { p, errors } = await page({ reduced });

  const idx = () =>
    p.evaluate(
      () =>
        document.querySelectorAll("#refCarousel .splide__slide.is-active")
          .length &&
        [...document.querySelectorAll("#refCarousel .splide__slide")].findIndex(
          (s) => s.classList.contains("is-active"),
        ),
    );

  const total = await p.evaluate(
    () => document.querySelectorAll("#refCarousel .splide__slide").length,
  );
  check(`carousel slides (reduced=${reduced})`, total, 6);

  /* wrap forward off the last slide */
  await p.evaluate(() => {
    for (let i = 0; i < 5; i++) document.getElementById("qNext").click();
  });
  await new Promise((r) => setTimeout(r, 700));
  check(`  last slide index`, await idx(), 5);

  await p.evaluate(() => document.getElementById("qNext").click());
  await new Promise((r) => setTimeout(r, 700));
  check(`  wraps to first`, await idx(), 0);

  await p.evaluate(() => document.getElementById("qPrev").click());
  await new Promise((r) => setTimeout(r, 700));
  check(`  prev from 0 wraps to last`, await idx(), 5);

  /* the counter and tab strip must follow the slide */
  const counter = await p.evaluate(
    () => document.getElementById("qNow").textContent,
  );
  check(`  counter tracks slide`, counter, "06");
  const activeTab = await p.evaluate(() =>
    [...document.querySelectorAll(".q-tab")].findIndex((t) =>
      t.classList.contains("is-active"),
    ),
  );
  check(`  active tab tracks slide`, activeTab, 5);

  check(
    `  no console errors`,
    errors.length ? errors.join("|") : "none",
    "none",
  );
  await p.close();
}

/* ---------- anchors land under the header ---------- */
for (const reduced of [false, true]) {
  const { p } = await page({ reduced });
  await p.evaluate(() =>
    document.querySelector('a[data-scroll][href="#about"]').click(),
  );
  await new Promise((r) => setTimeout(r, 1600));
  const gap = await p.evaluate(() =>
    Math.round(document.getElementById("about").getBoundingClientRect().top),
  );
  check(`anchor gap (reduced=${reduced})`, gap, 76);
  await p.close();
}

/* ---------- lenis present only when motion is allowed ---------- */
for (const reduced of [false, true]) {
  const { p } = await page({ reduced });
  const has = await p.evaluate(() =>
    document.documentElement.classList.contains("lenis"),
  );
  check(`html.lenis (reduced=${reduced})`, has, reduced ? "false" : "true");
  await p.close();
}

/* ---------- header hysteresis: wobbling across the old single trip point
   must not flip the bar back and forth ---------- */
{
  const { p } = await page();
  const flips = await p.evaluate(async () => {
    const h = document.getElementById("siteheader");
    let last = h.classList.contains("is-solid");
    let n = 0;
    for (const y of [18, 40, 22, 38, 20, 36, 24, 34]) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
      const now = h.classList.contains("is-solid");
      if (now !== last) n++;
      last = now;
    }
    return n;
  });
  check("header flips while jittering 18-40px", flips, 0);

  /* and it does still turn solid further down */
  const solid = await p.evaluate(async () => {
    window.scrollTo(0, 600);
    await new Promise((r) => setTimeout(r, 250));
    return document.getElementById("siteheader").classList.contains("is-solid");
  });
  check("header solid at 600px", solid, "true");
  await p.close();
}

/* ---------- mobile menu opens and closes from the burger ---------- */
{
  const { p } = await page({ width: 390 });
  const seq = await p.evaluate(async () => {
    const b = document.getElementById("burger");
    const m = document.getElementById("menu");
    const out = [];
    b.click();
    await new Promise((r) => setTimeout(r, 250));
    out.push(m.getAttribute("data-open"));
    b.click();
    await new Promise((r) => setTimeout(r, 250));
    out.push(m.getAttribute("data-open"));
    return out.join(",");
  });
  check("menu toggles open,closed", seq, "true,false");

  const overflow = await p.evaluate(
    () => document.body.style.overflow || "(empty)",
  );
  check("body overflow restored", overflow, "(empty)");
  await p.close();
}

await browser.close();
console.log(
  failed ? `\n${failed} check(s) failed` : "\nall behaviour checks passed",
);
process.exit(failed ? 1 : 0);
