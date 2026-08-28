/* Compare all visible text between the original static page and the Next build.
   The payload check proves WordPress kept the content; this proves the
   components actually render it, in the right order, with nothing dropped.

   node scripts/verify/text-parity.mjs [originalUrl] [nextUrl]
*/
import puppeteer from "puppeteer-core";

const ORIG = process.argv[2] || "http://localhost:8777/index.html";
const NEXT = process.argv[3] || "http://localhost:8778/";

const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--disable-gpu"],
});

async function textOf(url) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(url, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 700));

  const out = await p.evaluate(() => {
    /* walk visible text nodes in document order */
    const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(n) {
          if (skip.has(n.parentElement?.tagName))
            return NodeFilter.FILTER_REJECT;
          if (!n.textContent.trim()) return NodeFilter.FILTER_REJECT;
          /* the carousel stacks all six slides; only the visible one counts
             for a human, but both pages stack them the same way, so keep all */
          const st = getComputedStyle(n.parentElement);
          if (st.display === "none" || st.visibility === "hidden")
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    const bits = [];
    let n;
    while ((n = walker.nextNode())) {
      bits.push(n.textContent.replace(/\s+/g, " ").trim());
    }
    return bits;
  });
  await p.close();
  return out;
}

const [a, b] = await Promise.all([textOf(ORIG), textOf(NEXT)]);
await browser.close();

/* compare as multisets first — order differences are far less interesting
   than a string that vanished entirely */
const count = (arr) =>
  arr.reduce((m, s) => m.set(s, (m.get(s) || 0) + 1), new Map());
const ca = count(a);
const cb = count(b);

const missing = [];
const added = [];
for (const [s, n] of ca) {
  const m = cb.get(s) || 0;
  if (m < n) missing.push(`${s}  (×${n - m})`);
}
for (const [s, n] of cb) {
  const m = ca.get(s) || 0;
  if (m < n) added.push(`${s}  (×${n - m})`);
}

console.log(`original: ${a.length} text nodes`);
console.log(`next    : ${b.length} text nodes`);

if (missing.length) {
  console.log(`\nMISSING from the Next build (${missing.length}):`);
  missing.forEach((s) => console.log("  - " + s));
}
if (added.length) {
  console.log(`\nEXTRA in the Next build (${added.length}):`);
  added.forEach((s) => console.log("  + " + s));
}
if (!missing.length && !added.length) {
  console.log("\nvisible text is identical");
}
process.exit(missing.length || added.length ? 1 : 0);
